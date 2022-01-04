import base64
import datetime
import json
from functools import reduce
from io import StringIO
from os import getenv
from bokeh.models.widgets.tables import DataTable, DateFormatter, TableColumn

import numpy as np
import pandas as pd
import requests
import yaml
from bokeh.models import Column, ColumnDataSource, HoverTool, MultiChoice, Row
from bokeh.models.widgets.buttons import Button
from bokeh.models.widgets.groups import RadioGroup
from bokeh.models.widgets.inputs import (
    NumericInput,
    PasswordInput,
    TextAreaInput,
    TextInput,
)
from bokeh.plotting import figure
from bokeh.themes import Theme
from dotenv import load_dotenv
from glom import glom

load_dotenv()
query = (
    getenv("DEFAULT_QUERY")
    or "Select [System.Id] From WorkItems Where [System.WorkItemType] = 'User Story' AND [State] = 'Closed'"
)
ado_url = getenv("ADO_URL") or ""
access_token = getenv("ACCESS_TOKEN") or ""
historical_input_data = None
table_data = ColumnDataSource(data=dict(ClosedBy=[], ClosedDate=[]))
all_members = []
selected_members = []
report_type = 0
simulation_days = 0
last_days = 0


def forecast_work(doc):
    def split_list(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i : i + n]

    def set_ado_url(attr, old, new):
        global ado_url
        ado_url = new

    def set_access_token(attr, old, new):
        global access_token
        access_token = new

    def set_query(attr, old, new):
        global query
        query = new

    def reduce_work_item_batches(acc, work_item_ids):
        authorization_value = "Basic " + str(
            base64.b64encode(bytes(":" + access_token, "utf-8")), "utf-8"
        )
        headers = {
            "Authorization": authorization_value,
            "Content-Type": "application/json",
        }
        work_item_batch_response = requests.post(
            url=ado_url + "/_apis/wit/workitemsbatch?api-version=6.0",
            data=json.dumps(
                {
                    "ids": work_item_ids,
                    "fields": [
                        "System.Id",
                        "Microsoft.VSTS.Common.ClosedBy",
                        "Microsoft.VSTS.Common.ClosedDate",
                        "System.WorkItemType",
                    ],
                }
            ),
            headers=headers,
            timeout=5,
        )
        work_items = work_item_batch_response.json()
        return acc + list(
            map(lambda work_item: work_item["fields"], list(work_items["value"]))
        )

    def query_work_items():
        global historical_input_data
        global all_members
        global table_data
        if access_token == None:
            return
        authorization_value = "Basic " + str(
            base64.b64encode(bytes(":" + access_token, "utf-8")), "utf-8"
        )
        headers = {
            "Authorization": authorization_value,
            "Content-Type": "application/json",
        }
        query_payload = {"query": query}
        query_response = requests.post(
            url=ado_url + "/_apis/wit/wiql?api-version=6.0",
            data=json.dumps(query_payload),
            headers=headers,
            timeout=5,
        )
        if query_response.status_code != 200:
            return
        work_item_references = list(
            map(
                lambda work_item_reference: work_item_reference["id"],
                query_response.json()["workItems"],
            )
        )
        work_item_batches = list(split_list(work_item_references, 200))
        work_items = list(reduce(reduce_work_item_batches, work_item_batches, []))
        historical_input_data = pd.read_json(
            StringIO(json.dumps(work_items)),
        ).dropna()
        historical_input_data["Microsoft.VSTS.Common.ClosedBy"] = historical_input_data[
            "Microsoft.VSTS.Common.ClosedBy"
        ].apply(lambda row: glom(row, "displayName"))
        historical_input_data["Microsoft.VSTS.Common.ClosedDate"] = pd.to_datetime(
            historical_input_data["Microsoft.VSTS.Common.ClosedDate"],
            infer_datetime_format=True,
        ).dt.date
        all_members = (
            historical_input_data["Microsoft.VSTS.Common.ClosedBy"].unique().tolist()
        )
        team_member_multi_choice_selection.options = all_members
        table_data.data = dict(
            {
                "ClosedDate": [
                    value
                    for value in historical_input_data[
                        "Microsoft.VSTS.Common.ClosedDate"
                    ]
                ],
                "ClosedBy": [
                    str(value)
                    for value in historical_input_data["Microsoft.VSTS.Common.ClosedBy"]
                ],
            }
        )

    def set_forecast_type(attr, old, new):
        global report_type
        report_type = new
        simulation_days_input.visible = report_type == 0

    def set_last_days(attr, old, new):
        global last_days
        last_days = new

    def set_simulation_days(attr, old, new):
        global simulation_days
        simulation_days = new

    def select_all_team_members():
        team_member_multi_choice_selection.value = all_members

    def clear_team_members():
        team_member_multi_choice_selection.value = []
        if selected_members == []:
            throughput_figure.renderers = []
            distribution_figure.renderers = []
            return

    def render_graphs():
        if selected_members == []:
            throughput_figure.renderers = []
            distribution_figure.renderers = []
            return

        throughput = compute_throughput()
        render_throughput(throughput)
        render_monte_carlo_distribution(throughput)

    def render_monte_carlo_distribution(throughput):
        distribution_figure.renderers = []
        simulations = 10000
        dataset = throughput[["User Story"]].tail(last_days).reset_index(drop=True)
        samples = [
            dataset.sample(n=simulation_days, replace=True).sum()["User Story"]
            for i in range(simulations)
        ]
        print(samples)
        samples = pd.DataFrame(samples, columns=["Items"])
        distribution = samples.groupby(["Items"]).size().reset_index(name="Frequency")
        print(distribution)
        distribution_figure.vbar(
            distribution["Items"], top=distribution["Frequency"], width=0.5
        )

    def compute_throughput():
        filtered_data = historical_input_data[
            (
                historical_input_data["Microsoft.VSTS.Common.ClosedBy"].isin(
                    selected_members
                )
            )
        ]
        throughput = pd.crosstab(
            filtered_data["Microsoft.VSTS.Common.ClosedDate"],
            filtered_data["System.WorkItemType"],
            colnames=[None],
        ).reset_index()
        throughput["Story Throughput"] = throughput["User Story"]
        # throughput["Defect Throughput"] = throughput["Bug"]
        throughput["Total Throughput"] = throughput["User Story"]
        date_range = pd.date_range(
            start=throughput["Microsoft.VSTS.Common.ClosedDate"].min(),
            end=throughput["Microsoft.VSTS.Common.ClosedDate"].max(),
        )
        throughput = (
            throughput.set_index("Microsoft.VSTS.Common.ClosedDate")
            .reindex(date_range)
            .fillna(0)
            .astype(int)
            .rename_axis("Date")
        )
        return throughput

    def render_throughput(throughput):
        throughput_per_week = pd.DataFrame(
            throughput["User Story"].resample("W-Mon").sum(),
        ).reset_index()
        figure_source = ColumnDataSource(throughput_per_week)
        throughput_figure.renderers = []
        throughput_figure.line("Date", "User Story", source=figure_source)

    def select_team_member(attr, old, new):
        global selected_members
        selected_members = new

    input_ado_url = TextInput(placeholder="ADO URL", value=ado_url)
    input_ado_url.on_change("value", set_ado_url)
    input_access_token = PasswordInput(
        placeholder="Access Token with workitem.read scope", value=access_token
    )
    input_access_token.on_change("value", set_access_token)
    query_button = Button(label="Query Work Items")
    query_button.on_click(query_work_items)
    input_customize_query = TextAreaInput(placeholder="Query", value=query, height=80)
    input_customize_query.on_change("value", set_query)
    columns = [
        TableColumn(
            field="ClosedDate",
            title="Closed Date",
        ),
        TableColumn(field="ClosedBy", title="Closed By"),
    ]
    input_data_table = DataTable(
        height=500,
        autosize_mode="force_fit",
        source=table_data,
        columns=columns,
        sizing_mode="stretch_width",
    )
    input_data_layout = Column(
        input_ado_url,
        input_access_token,
        input_customize_query,
        query_button,
        input_data_table,
    )

    forecast_type_selection = RadioGroup(
        labels=["How Many Items in Time Frame", "When will N items be completed"]
    )
    forecast_type_selection.on_change("active", set_forecast_type)

    simulation_days_input = NumericInput(
        visible=False, placeholder="Time frame in days"
    )
    simulation_days_input.on_change("value", set_simulation_days)
    how_many_type_options = Row(simulation_days_input)
    when_type_options = Row()
    forecast_type_controls = Column(
        forecast_type_selection, how_many_type_options, when_type_options
    )

    team_member_multi_choice_selection = MultiChoice(
        options=all_members, placeholder="Select Team Members"
    )
    team_member_multi_choice_selection.on_change("value", select_team_member)
    select_all_team_members_button = Button(label="Select All")
    select_all_team_members_button.on_click(select_all_team_members)
    clear_team_members_button = Button(label="Clear")
    clear_team_members_button.on_click(clear_team_members)
    buttons = Column(
        select_all_team_members_button,
        clear_team_members_button,
    )
    team_member_selection_controls = Row(team_member_multi_choice_selection, buttons)

    last_days_input = NumericInput(placeholder="Use the last N days of historical data")
    last_days_input.on_change("value", set_last_days)

    run_button = Button(label="Run")
    run_button.on_click(render_graphs)

    setup_controls_layout = Column(
        forecast_type_controls,
        last_days_input,
        team_member_selection_controls,
        run_button,
    )

    throughput_hover_tools = HoverTool(
        tooltips=[
            ("Count", "@Story{%0.000000f}"),
            ("Date", "@Date{%m-%d-%Y}"),
        ],
        formatters={
            "@Date": "datetime",
            "@Story": "printf",
        },
    )
    throughput_figure = figure(
        title="Throughput",
        plot_height=400,
        x_axis_label="Date",
        x_axis_type="datetime",
        y_axis_label="Count",
    )
    throughput_figure.add_tools(throughput_hover_tools)

    distribution_figure = figure(
        title="Monte Carlo Distribution",
        plot_height=400,
        x_axis_label="Count",
        y_axis_label="Frequency",
    )
    distribution_hover_tools = HoverTool(
        tooltips=[
            ("Count", "@x{%0.000000f}"),
            ("Frequency", "@top{%0.000000f}"),
        ],
        formatters={
            "@x": "printf",
            "@top": "printf",
        },
    )
    distribution_figure.add_tools(distribution_hover_tools)

    figures_layout = Column(throughput_figure, distribution_figure)

    layout = Row(input_data_layout, setup_controls_layout, figures_layout)

    doc.add_root(layout)
    doc.theme = Theme(
        json=yaml.load(
            """
        attrs:
            Figure:
                background_fill_color: "#DDDDDD"
                outline_line_color: white
                toolbar_location: above
                height: 500
                width: 800
    """,
            Loader=yaml.FullLoader,
        )
    )
