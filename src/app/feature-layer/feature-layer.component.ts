import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import PopupTemplate from '@arcgis/core/PopupTemplate';
import Fullscreen from '@arcgis/core/widgets/Fullscreen';
import * as L from 'leaflet';


@Component({
  selector: 'app-feature-layer',
  templateUrl: './feature-layer.component.html',
  styleUrls: ['./feature-layer.component.scss']
})
export class FeatureLayerComponent implements OnInit {

  data = [
    {
      iso3code: "IND",
      score: 4
    },
    {
      iso3code: "PAK",
      score: 3
    },
    {
      iso3code: "ARG",
      score: 4
    },
    {
      iso3code: "AFG",
      score: 2
    },
    {
      iso3code: "BGD",
      score: 2
    },
    {
      iso3code: "CHN",
      score: 3
    },
    {
      iso3code: "DNK",
      score: 4
    },
    {
      iso3code: "EST",
      score: 1
    },
    {
      iso3code: "FRA",
      score: 5
    },
    {
      iso3code: "DEU",
      score: 5
    }

  ]

  view!: MapView;
  @ViewChild('map', { static: true }) private mapViewEl!: ElementRef;

  basemapUrl: string = 'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_Dark_Grey/VectorTileServer';
  featureUrl: string = "https://services.arcgis.com/5T5nSi527N4F7luB/ArcGIS/rest/services/Detailed_Boundary_ADM0/FeatureServer/0/"

  ngOnInit() {
    var maxScreenDimension = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
    // assuming tiles are 256 x 256
    var tileSize = 512;
    // Here the function used is the floor because world repeat not needed
    // Use Math.ceil if needed world repeat in future.
    var maxTiles = Math.floor(maxScreenDimension / tileSize);

    // Here the function used is the ceil because world repeat not needed
    // Use Math.floor if needed world repeat in future.
    var minZoom = Math.ceil(Math.log(maxTiles) / Math.log(2));
    minZoom = minZoom - 0.7

    // only let minZoom be 2 or higher
    minZoom = minZoom < 2 ? 2 : minZoom;
    var bounds = [[90, 180], [-90, -180]];
    this.initializeMap().then(() => { });

  }

  initializeMap(): Promise<any> {

    const defaultSymbolForBaseMap = new SimpleFillSymbol({
      color: [256, 256, 256],
      outline: {
        color: [0, 0, 0, 0.4],
        width: 0.4,
      },
    });

    const newUniqueValueRenderer = new UniqueValueRenderer({
      field: 'WHO_CODE',
      defaultSymbol: defaultSymbolForBaseMap,
      defaultLabel: 'WHO_CODE',
    });
    const mapBaseLayer = new VectorTileLayer({
      url: this.basemapUrl,

    });




    // Create a Basemap with the VectorTileLayer
    const customBasemap = new Basemap({
      baseLayers: [mapBaseLayer],
    });

    const featureLayer = new FeatureLayer({
      url: this.featureUrl,
      renderer: new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: 'rgba(0,76,115,0.04)'
        })
      }),

      popupTemplate: new PopupTemplate({
        title: '{ADM0_VIZ_NAME}',
        overwriteActions: true,
        content: [],
        outFields: ['WHO_CODE'],
      }),
    })

    const map = new Map({
      basemap: customBasemap,
      layers: [featureLayer],

    });

    

    // Create a MapView instance (for 2D viewing) and reference the map instance

    const view = new MapView({
      container: "map",
      map: map,
      zoom: 1,
      constraints: {
        minZoom: 1,
        
      },

    });

    view.watch("extent", function() {

    })

    // view.on("click", function(e) {
    //   console.log(e);
    // });

    // view.watch("zoom", function (e) {
    //   console.log(e);
    // })


    this.data.forEach((country) => {
      newUniqueValueRenderer.addUniqueValueInfo(
        country.iso3code,
        new SimpleFillSymbol({ color: this.getColor(country.score) })
      )
    })

    featureLayer.renderer = newUniqueValueRenderer;

    let fullscreen = new Fullscreen({
      view: this.view,
    });
    this.view.ui.add(fullscreen, 'bottom-right');

    return this.view.when();

  }

  getColor(score: number): string {
    switch (score) {
      case 1: return "#ff0000";
      case 2: return "#ffcc00";
      case 3: return "#ffcc00";
      case 4: return "#009933";
      case 5: return "#009933";
      default: return "#004c730a";
    }
  }



}
