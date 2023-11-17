import { Component, EventEmitter, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as Vector from 'esri-leaflet-vector';
import * as esri from 'esri-leaflet';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-map-component',
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.scss']
})
export class MapComponentComponent implements OnInit {

  basemapUrl = 'https://tiles.arcgis.com/tiles/5T5nSi527N4F7luB/arcgis/rest/services/WHO_Polygon_Basemap_Dark_Grey/VectorTileServer';
  featureUrl = 'https://services.arcgis.com/5T5nSi527N4F7luB/arcgis/rest/services/DASH_PUBLIC_INCIDENTS/FeatureServer/0';

  regionSelected = new Subject<string>();

  ngOnInit(): void {
    const map = L.map('map').setView([0, 0], 2);

    this.setBasemapLayer(map);
    const featureLayer = this.setFeatureLayer(map);

    this.regionSelected.subscribe({
      next: (reg: string) => {
        this.showSelectedRegion(reg, map);
      },
      error: (err: Error) => {
        console.log(err);
      }
    })
  }

  // sets the basemap layer
  setBasemapLayer(map: L.Map) {
    const layer = Vector.vectorTileLayer(this.basemapUrl, {
      minZoom: 1,
      maxZoom: 13,
    });

    layer.addTo(map);
  };


  // feature layer to add the colors
  setFeatureLayer(map: L.Map): esri.FeatureLayer {
    const colorFeatureLayer = esri.featureLayer({
      url: this.featureUrl,
      style: function (feature) {
        var gradingStyle = {
          weight: 0.4,
          opacity: 0.8,
          fillOpacity: 0.55,
          color: 'grey'
        };
        switch (feature.properties.region) {
          case 'SEARO': gradingStyle.color = 'orange'; break;
          case 'AFRO': gradingStyle.color = 'green'; break;
          case 'AMRO': gradingStyle.color = 'blue'; break;
          case 'EMRO': gradingStyle.color = 'red'; break;
          case 'EURO': gradingStyle.color = 'brown'; break;
          case 'WPRO': gradingStyle.color = 'yellow'; break;
        }
        return gradingStyle;
      },
    })
    colorFeatureLayer.addTo(map);
    return colorFeatureLayer;
  }

  // emits the value of dropdown 
  onOptionSelect(event: any) {
    this.regionSelected.next(event.target.value);
  }

  // Show the region selected from dropdown.
  //manually setting the view for regions
  showSelectedRegion(region: string, map: L.Map) {
    let center;
    let zoomLevel;
    switch (region) {
      case 'SEARO':
        center = [15.11989876, 101.01490782];
        zoomLevel = 3.5;
        break;
      case 'AFRO':
        center = [2.4601811810210052, 22.851562500000004];
        zoomLevel = 3;
        break;
      case 'AMRO':
        center = [53.12040528310657, -85.78125];
        zoomLevel = 3;
        break;
      case 'EMRO':
        center = [27.68352808378776, 43.59375000000001];
        zoomLevel = 3;
        break;
      case 'EURO':
        center = [64.47279382008166, 50.62500000000001];
        zoomLevel = 3;
        break;
      case 'WPRO':
        center = [9.44906182688142, 124.45312500000001];
        zoomLevel = 3;
        break;
      case 'World':
        center = [0, 0];
        zoomLevel = 2;
        break;
      default:
        center = [0, 0];
        zoomLevel = 2;
        break;
    }
    map.setView(center as L.LatLngTuple, zoomLevel);
  }
}