import datetime
from bokeh.models.annotations import Title
from bokeh.models.widgets.buttons import Button, Toggle
from bokeh.models.widgets.groups import RadioGroup
from bokeh.models.widgets.inputs import NumericInput

import pandas as pd
import yaml
from bokeh.io import curdoc, output_file, output_notebook
from bokeh.layouts import column, gridplot, row, widgetbox
from bokeh.models import (
    Column,
    ColumnDataSource,
    HoverTool,
    MultiChoice,
    Row,
)
from bokeh.models.widgets import Panel, Tabs
from bokeh.palettes import Spectral6
from bokeh.plotting import figure, show
from bokeh.sampledata.sea_surface_temperature import sea_surface_temperature
from bokeh.themes import Theme

DATA_FILE_PATH = "Historical Data for Forecasting.csv"
LAST_DAYS = 180
SIMULATION_ITEMS = 15
DATE_TO_BEGIN_WORKING_ON_ITEMS = "2021-01-01"


def datesWithoutTime(item):
    item["Closed Date"] = datetime.datetime.strptime(
        item["Closed Date"].strftime("%Y-%m-%d"), "%Y-%m-%d"
    ).date()
    return item


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
    simulations = 10000
    dataset = throughput[["Story"]].tail(last_days).reset_index(drop=True)
    samples = [
        dataset.sample(n=simulation_days, replace=True).sum()["Story"]
        for i in range(simulations)
    ]
    samples = pd.DataFrame(samples, columns=["Items"])
    distribution = samples.groupby(["Items"]).size().reset_index(name="Frequency")
    distribution_figure.vbar(
        distribution["Items"], top=distribution["Frequency"], width=0.5
    )
    # ax.set_title(
    #     f"Distribution of Monte Carlo Simulation 'How Many' ({simulations} Runs)",
    #     loc="left",
    #     fontdict={"size": 18, "weight": "semibold"},
    # )
    # ax.set_xlabel(f"Total Items Completed in {simulation_days} Days")
    # ax.set_ylabel("Frequency")
    # ax.axhline(y=simulations * 0.001, color=darkgrey, alpha=0.5)


def compute_throughput():
    filtered_data = kanban_data[(kanban_data["Closed By"].isin(selected_members))]
    throughput = pd.crosstab(
        filtered_data["Closed Date"], filtered_data["Work Item Type"], colnames=[None]
    ).reset_index()
    throughput["Story Throughput"] = throughput["User Story"]
    throughput["Defect Throughput"] = throughput["Bug"]
    throughput["Total Throughput"] = throughput["User Story"] + throughput["Bug"]
    date_range = pd.date_range(
        start=throughput["Closed Date"].min(), end=throughput["Closed Date"].max()
    )
    throughput = (
        throughput.set_index("Closed Date")
        .reindex(date_range)
        .fillna(0)
        .astype(int)
        .rename_axis("Date")
    )
    throughput_df = pd.DataFrame(
        {
            "All": throughput["Total Throughput"].resample("W-Mon").sum(),
            "Story": throughput["Story Throughput"].resample("W-Mon").sum(),
            "Defect": throughput["Defect Throughput"].resample("W-Mon").sum(),
        }
    ).reset_index()
    return throughput_df


def render_throughput(throughput):
    figure_source = ColumnDataSource(throughput)
    throughput_figure.renderers = []
    throughput_figure.line("Date", "Story", source=figure_source)


def select_team_member(attr, old, new):
    global selected_members
    selected_members = new


kanban_data = (
    pd.read_csv(
        DATA_FILE_PATH,
        usecols=["Closed Date", "Work Item Type", "Closed By"],
        parse_dates=["Closed Date"],
    )
    .dropna()
    .transform(datesWithoutTime, "columns")
)
kanban_data.head(1)

all_members = kanban_data["Closed By"].unique().tolist()
selected_members = []
report_type = 0
simulation_days = 0
last_days = 0

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

forecast_type_selection = RadioGroup(
    labels=["How Many Items in Time Frame", "When will N items be completed"]
)
forecast_type_selection.on_change("active", set_forecast_type)

simulation_days_input = NumericInput(visible=False, placeholder="Time frame in days")
simulation_days_input.on_change("value", set_simulation_days)
how_many_type_options = Row(simulation_days_input)
when_type_options = Row()

forecast_type_controls = Column(
    forecast_type_selection, how_many_type_options, when_type_options
)

last_days_input = NumericInput(placeholder="Use the last N days of historical data")
last_days_input.on_change("value", set_last_days)

run_button = Button(label="Run")
run_button.on_click(render_graphs)

controls = Column(
    forecast_type_controls, last_days_input, team_member_selection_controls, run_button
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

figures = Column(throughput_figure, distribution_figure)

layout = Row(controls, figures)

curdoc().add_root(layout)
curdoc().theme = Theme(
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
