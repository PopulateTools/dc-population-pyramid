import "./styles.css";
import populationPyramid from "dc-population-pyramid";
import * as d3 from "d3";
import crossfilter from "crossfilter2";
import { chartRegistry, renderAll, pieChart } from "dc";

const chart = populationPyramid("#chart", "main");
chartRegistry.register(chart, "main");
const filter = pieChart("#filter", "main");
const state = pieChart("#state", "main");

d3.csv("data/data.csv").then((experiments) => {
  var ndx = crossfilter(experiments),
    ageGenderDimension = ndx.dimension(function (d) {
      let age_range;

      if (d.age <= 9) {
        age_range = "0 - 9";
      } else if (d.age <= 19) {
        age_range = "10 - 19";
      } else if (d.age <= 29) {
        age_range = "20 - 29";
      } else if (d.age <= 39) {
        age_range = "30 - 39";
      } else if (d.age <= 49) {
        age_range = "40 - 49";
      } else if (d.age <= 59) {
        age_range = "50 - 59";
      } else if (d.age <= 69) {
        age_range = "60 - 69";
      } else if (d.age <= 79) {
        age_range = "70 - 79";
      } else if (d.age <= 89) {
        age_range = "80 - 89";
      } else if (d.age <= 99) {
        age_range = "90 - 99";
      } else if (d.age >= 100) {
        age_range = "100+";
      }

      return [d.gender, age_range];
    }),
    ageGenderGroup = ageGenderDimension.group().reduceCount(),
    genderDimension = ndx.dimension((d) => d.gender),
    genderGroup = genderDimension.group().reduceCount(),
    stateDimension = ndx.dimension((d) => d.state),
    stateGroup = stateDimension.group().reduceCount();

  const group = {
    all: function () {
      var age_ranges = [
        "0 - 9",
        "10 - 19",
        "20 - 29",
        "30 - 39",
        "40 - 49",
        "50 - 59",
        "60 - 69",
        "70 - 79",
        "80 - 89",
        "90 - 99",
        "100+"
      ];

      // convert to object so we can easily tell if a key exists
      let values = {};
      ageGenderGroup.all().forEach(function (d) {
        values[d.key[0] + "." + d.key[1]] = d.value;
      });

      // convert back into an array for the chart, making sure that all age_ranges exist
      let g = [];
      age_ranges.forEach(function (age_range) {
        g.push({
          key: ["Male", age_range],
          value: values["Male." + age_range] || 0
        });
        g.push({
          key: ["Female", age_range],
          value: values["Female." + age_range] || 0
        });
      });

      return g;
    }
  };

  chart.options({
    width: 250,
    height: 250,
    labelOffsetX: -50,
    fixedBarHeight: 10,
    gap: 10,
    colorCalculator({ key }) {
      if (key[0] === "Male") {
        return "#5A9BCA";
      }
      return "#C95AC7";
    },
    dimension: ageGenderDimension,
    group,
    renderTitleLabel: true,
    title(d) {},
    label({ key }) {
      return key[1];
    },
    cap: 15,
    elasticX: true,
    leftKeyFilter({ key }) {
      return key[0] === "Male";
    },
    rightKeyFilter({ key }) {
      return key[0] === "Female";
    }
  });

  chart.pyramidChart();

  chart.rightChart().on("filtered", function () {
    state.redraw();
    filter.redraw();
    chart.rightChart().redraw();
  });

  chart.leftChart().on("filtered", function () {
    state.redraw();
    filter.redraw();
    chart.leftChart().redraw();
  });

  filter.options({
    dimension: genderDimension,
    group: genderGroup
  });

  state.options({
    dimension: stateDimension,
    group: stateGroup
  });

  renderAll("main");
});
