import { Component, OnInit } from '@angular/core';
// import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
// import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
// import am5geodata_continentsHigh from '@amcharts/amcharts5-geodata/continentsHigh';
// import {Position} from 'geojson';


// import * as am5 from "@amcharts/amcharts5";
// import * as am5map from "@amcharts/amcharts5/map";



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  cities = [
    {
      id: "london",
      title: "London",
      geometry: { type: "Point", coordinates: [-0.1262, 51.5002] },
    },
    {
      id: "brussels",
      title: "Brussels",
      geometry: { type: "Point", coordinates: [4.3676, 50.8371] }
    }, {
      id: "prague",
      title: "Prague",
      geometry: { type: "Point", coordinates: [14.4205, 50.0878] }
    }, {
      id: "athens",
      title: "Athens",
      geometry: { type: "Point", coordinates: [23.7166, 37.9792] }
    }, {
      id: "reykjavik",
      title: "Reykjavik",
      geometry: { type: "Point", coordinates: [-21.8952, 64.1353] }
    }, {
      id: "dublin",
      title: "Dublin",
      geometry: { type: "Point", coordinates: [-6.2675, 53.3441] }
    }, {
      id: "oslo",
      title: "Oslo",
      geometry: { type: "Point", coordinates: [10.7387, 59.9138] }
    }, {
      id: "lisbon",
      title: "Lisbon",
      geometry: { type: "Point", coordinates: [-9.1355, 38.7072] }
    }, {
      id: "moscow",
      title: "Moscow",
      geometry: { type: "Point", coordinates: [37.6176, 55.7558] }
    }, {
      id: "belgrade",
      title: "Belgrade",
      geometry: { type: "Point", coordinates: [20.4781, 44.8048] }
    }, {
      id: "bratislava",
      title: "Bratislava",
      geometry: { type: "Point", coordinates: [17.1547, 48.2116] }
    }, {
      id: "ljublana",
      title: "Ljubljana",
      geometry: { type: "Point", coordinates: [14.5060, 46.0514] }
    }, {
      id: "madrid",
      title: "Madrid",
      geometry: { type: "Point", coordinates: [-3.7033, 40.4167] }
    }, {
      id: "stockholm",
      title: "Stockholm",
      geometry: { type: "Point", coordinates: [18.0645, 59.3328] }
    }, {
      id: "bern",
      title: "Bern",
      geometry: { type: "Point", coordinates: [7.4481, 46.9480] }
    }, {
      id: "kiev",
      title: "Kiev",
      geometry: { type: "Point", coordinates: [30.5367, 50.4422] }
    }, {
      id: "paris",
      title: "Paris",
      geometry: { type: "Point", coordinates: [2.3510, 48.8567] }
    }, {
      id: "new york",
      title: "New York",
      geometry: { type: "Point", coordinates: [-74, 40.43] }
    }];

  constructor() { }

  ngOnInit(): void {
    // this.generateMap();
  }

  // generateMap() {

    // /* Chart code */
    // // Create root element
    // // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    // let root = am5.Root.new("chartdiv");

    // // Set themes
    // // https://www.amcharts.com/docs/v5/concepts/themes/
    // root.setThemes([
    //   am5themes_Animated.new(root)
    // ]);


    // // Create the map chart
    // // https://www.amcharts.com/docs/v5/charts/map-chart/
    // let chart = root.container.children.push(am5map.MapChart.new(root, {
    //   panX: "translateX",
    //   panY: "translateY",
    //   projection: am5map.geoMercator()
    // }));



    // Add labels and controls
    // cont.children.push(am5.Label.new(root, {
    //   centerY: am5.p50,
    //   text: "Map"
    // }));

    // let switchButton = cont.children.push(am5.Button.new(root, {
    //   themeTags: ["switch"],
    //   centerY: am5.p50,
    //   icon: am5.Circle.new(root, {
    //     themeTags: ["icon"]
    //   })
    // }));

    // switchButton.on("active", function () {
    //   if (!switchButton.get("active")) {
    //     chart.set("projection", am5map.geoMercator());
    //     chart.set("panX", "translateX");
    //     chart.set("panY", "translateY");
    //   }
    //   else {
    //     chart.set("projection", am5map.geoOrthographic());
    //     chart.set("panX", "rotateX");
    //     chart.set("panY", "rotateY");
    //   }
    // });

    // cont.children.push(am5.Label.new(root, {
    //   centerY: am5.p50,
    //   text: "Globe"
    // }));

    // chart.chartContainer.set("background", am5.Rectangle.new(root, {
    //   fill: am5.color(0xd4f1f9),
    //   fillOpacity: 1
    // }));

    // Create main polygon series for countries
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    // let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    //   geoJSON: am5geodata_worldLow
    // }));

    // let polygonSeries = chart.series.push(
    //   am5map.MapPolygonSeries.new(root, {
    //     geoJSON: am5geodata_worldLow,
    //     fill: am5.color(0xffffff),
    //     stroke: am5.color(0xffffff),
    //     opacity: .2
    //   })
    // );



  //   // let graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
  //   // graticuleSeries.mapLines.template.setAll({
  //   //   stroke: root.interfaceColors.get("alternativeBackground"),
  //   //   strokeOpacity: 0.08
  //   // });

  //   // Create line series for trajectory lines
  //   // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
  //   let lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
  //   lineSeries.mapLines.template.setAll({
  //     stroke: root.interfaceColors.get("alternativeBackground"),
  //     strokeOpacity: 1
  //   });

  //   // destination series
  //   let citySeries = chart.series.push(
  //     am5map.MapPointSeries.new(root, {})
  //   );

  //   citySeries.bullets.push(function () {
  //     let circle = am5.Circle.new(root, {
  //       radius: 5,
  //       tooltipText: "{title}",
  //       tooltipY: 0,
  //       fill: am5.color(0xffffff),
  //       stroke: root.interfaceColors.get("background"),
  //       strokeWidth: 2,
  //       // opacity: .6
  //       opacity: 0
  //     });

  //     return am5.Bullet.new(root, {
  //       sprite: circle
  //     });
  //   });

  //   // arrow series
  //   let arrowSeries = chart.series.push(
  //     am5map.MapPointSeries.new(root, {})
  //   );

  //   arrowSeries.bullets.push(function () {
  //     let arrow = am5.Graphics.new(root, {
  //       fill: am5.color(0x000000),
  //       stroke: am5.color(0x000000),
  //       draw: function (display) {
  //         display.moveTo(0, -3);
  //         display.lineTo(8, 0);
  //         display.lineTo(0, 3);
  //         display.lineTo(0, -3);
  //       }
  //     });

  //     return am5.Bullet.new(root, {
  //       sprite: arrow
  //     });
  //   });

  //   let cities = [
  //     {
  //       id: "bucharest",
  //       title: "Bucharest",
  //       geometry: { type: "Point", coordinates: [26.1022222, 44.5722222] },
  //     },
  //     {
  //       id: "brussels",
  //       title: "Brussels",
  //       geometry: { type: "Point", coordinates: [4.45388889, 50.4591667] },
  //     },
  //    ];

  //   citySeries.data.setAll(cities);

  //   // prepare line series data
  //   let destinations = ["bucharest", "brussels"];
  //   // Departure coordinates
  //   let originLongitude = [26.1022222];
  //   let originLatitude = [44.5722222];

  //   am5.array.each(destinations, function (did) {
  //     let destinationDataItem = citySeries.getDataItemById(did);


  //     // let lineDataItem = lineSeries.pushDataItem({ geometry: { type: "MultiLineString", coordinates: [[originLongitude, originLatitude], [destinationDataItem.get("longitude"), destinationDataItem.get("latitude")]] } });

  //     // arrowSeries.pushDataItem({
  //     //   lineDataItem: lineDataItem,
  //     //   positionOnLine: 0.5,
  //     //   autoRotate: true
  //     // });
  //   })

  //   polygonSeries.events.on("datavalidated", function () {
  //     // add +6 latitude
  //     chart.zoomToGeoPoint({ longitude: 26.1022222, latitude: 44.5722222 }, 1.5);
  //   })


  //   // Make stuff animate on load
  //   chart.appear(8000, 100);
  // }
}
