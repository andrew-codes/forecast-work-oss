import yaml
import pandas as pd
from bokeh.plotting import figure, show
from bokeh.io import output_notebook, curdoc, output_file
from bokeh.models import (
    ColumnDataSource,
    HoverTool,
    CategoricalColorMapper,
    Slider,
    Column,
    Select,
    MultiChoice,
    CDSView,
    BooleanFilter,
)
from bokeh.models import CheckboxGroup, CustomJS
from bokeh.models.widgets import Tabs, Panel
from bokeh.layouts import row, column, gridplot, widgetbox
from bokeh.palettes import Spectral6
from bokeh.themes import Theme
import datetime
from bokeh.sampledata.sea_surface_temperature import sea_surface_temperature

DATA_FILE_PATH = "Historical Data for Forecasting.csv"
LAST_DAYS = 180
SIMULATION_ITEMS = 15
DATE_TO_BEGIN_WORKING_ON_ITEMS = "2021-01-01"
darkgrey = "#3A3A3A"
lightgrey = "#414141"


def datesWithoutTime(item):
    item["Closed Date"] = datetime.datetime.strptime(
        item["Closed Date"].strftime("%Y-%m-%d"), "%Y-%m-%d"
    ).date()
    return item


def select_team_member(attr, old, new):
    selected_team_members = new
    filtered_data = kanban_data[(kanban_data["Closed By"].isin(selected_team_members))]
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
    new_all_throughput = pd.DataFrame(
        {
            "All": throughput["Total Throughput"].resample("W-Mon").sum(),
            "Story": throughput["Story Throughput"].resample("W-Mon").sum(),
            "Defect": throughput["Defect Throughput"].resample("W-Mon").sum(),
        }
    ).reset_index()
    source.data = new_all_throughput
    p.renderers = []
    p.line("Date", "Story", source=source)


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
team_members = kanban_data["Closed By"].unique().tolist()
selected_team_members = team_members
filtered_data = kanban_data[(kanban_data["Closed By"].isin(selected_team_members))]
print(filtered_data)
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

all_throughput = pd.DataFrame(
    {
        "All": throughput["Total Throughput"].resample("W-Mon").sum(),
        "Story": throughput["Story Throughput"].resample("W-Mon").sum(),
        "Defect": throughput["Defect Throughput"].resample("W-Mon").sum(),
    }
).reset_index()
source = ColumnDataSource(all_throughput)
print(all_throughput)

p = figure(plot_height=400, x_axis_label="Date", y_axis_label="Count")
p.line("Date", "Story", source=source)

team_member_selection = MultiChoice(options=team_members)
team_member_selection.on_change("value", select_team_member)

layout = Column(team_member_selection, p)

#  -------


df = sea_surface_temperature.copy()
source = ColumnDataSource(data=df)

plot = figure(
    x_axis_type="datetime",
    y_range=(0, 25),
    y_axis_label="Temperature (Celsius)",
    title="Sea Surface Temperature at 43.18, -70.43",
)
plot.line("time", "temperature", source=source)


def callback(attr, old, new):
    if new == 0:
        data = df
    else:
        data = df.rolling("{0}D".format(new)).mean()
    source.data = ColumnDataSource.from_df(data)


slider = Slider(start=0, end=30, value=0, step=1, title="Smoothing by N Days")
slider.on_change("value", callback)

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
        Grid:
            grid_line_dash: [6, 4]
            grid_line_color: white
""",
        Loader=yaml.FullLoader,
    )
)
