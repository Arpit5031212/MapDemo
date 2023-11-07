import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as Vector from 'esri-leaflet-vector';
import * as esri from 'esri-leaflet';

@Component({
  selector: 'app-map-component',
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.scss']
})
export class MapComponentComponent implements OnInit {

  ngOnInit(): void {

    const map = L.map('map').setView([0, 0], 2);
    const basemapUrl = 'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_Dark_Grey/VectorTileServer';

    const layer = Vector.vectorTileLayer(basemapUrl, {
      minZoom: 1,
      maxZoom: 13,
    });

    layer.addTo(map);

    const colorFeatureLayer = esri.featureLayer({
      url: 'https://services.arcgis.com/5T5nSi527N4F7luB/arcgis/rest/services/DASH_PUBLIC_INCIDENTS/FeatureServer/0',
      style: function (feature) {
        var gradingStyle = {
          weight: 0.4,
          opacity: 0.8,
          fillOpacity: 0.55,
          color: 'grey'
        };
        if (feature.properties.countryiso2 === 'BD') { gradingStyle.color = 'blue' }
        return gradingStyle;
      }
    })

    colorFeatureLayer.addTo(map);
  }
}
