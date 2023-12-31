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
  featureUrl: string = "https://services.arcgis.com/5T5nSi527N4F7luB/ArcGIS/rest/services/Detailed_Boundary_ADM0/FeatureServer/0/"

  regionSelected = new Subject<string>();

  // stores the current feature layer.
  colorFeatureLayer: esri.FeatureLayer | null = null;

  ngOnInit(): void {
    const boundsAndMinzoom = this.getBoundsAndMinzoom();

    const map = L.map('map', {
      zoom: boundsAndMinzoom.minZoom,       
      maxBounds: boundsAndMinzoom.bounds,   // setting bounds for map view
      maxBoundsViscosity: 1,
      minZoom: boundsAndMinzoom.minZoom,    // minimum zoom level
    }).setView([0, 0], 2);

    this.setBasemapLayer(map);
    this.setFeatureLayer(map);


    this.regionSelected.subscribe({
      next: (reg: string) => {

        // removing the color feature layer if present before adding a new one.
        if (this.colorFeatureLayer) {
          map.removeLayer(this.colorFeatureLayer);
        }
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

  setFeatureLayer(map: L.Map) {
    const featureLayer = esri.featureLayer({
      url: this.featureUrl,
      style: function (feature) {
        var gradingStyle = {
          weight: 0.4,
          opacity: 0.5,
          fillOpacity: 0.4,
          color: 'grey'
        };
        return gradingStyle;
      }
    })
    featureLayer.addTo(map);

    // bind popup to the layer on hover event
    featureLayer.bindPopup("", { minWidth: 100, closeButton: true });
    featureLayer.on("mouseover", function (e) {

      // setting up popup content
      const popupContent = `${e.layer?.feature?.properties?.ADM0_NAME} (${e.layer?.feature?.properties?.WHO_REGION})`;
      featureLayer.setPopupContent(popupContent);
      featureLayer.openPopup(e.latlng); // open popup
    })

    // close popup when moved out of the country.
    featureLayer.on('mouseout', function () {
      featureLayer.closePopup();
    })
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

    // setting the zoom level and center point for regions.
    switch (region) {
      case 'SEARO':
        center = [15.11989876, 101.01490782];
        zoomLevel = 4;
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
      case 'WORLD':
        center = [0, 0];
        zoomLevel = 2;
        break;
      default:
        center = [0, 0];
        zoomLevel = 2;
        break;
    }

    map.setView(center as L.LatLngTuple, zoomLevel);

    // setting the feature layer to show color in the selected region
    this.colorFeatureLayer = esri.featureLayer({
      url: this.featureUrl,
      style: function (feature) {
        var gradingStyle = {
          weight: 0.4,
          opacity: 0.8,
          fillOpacity: 0.55,
          color: 'grey'
        };
        if (feature.properties.WHO_REGION === region) {
          switch (feature.properties.WHO_REGION) {
            case 'SEARO': gradingStyle.color = 'orange'; break;
            case 'AFRO': gradingStyle.color = 'green'; break;
            case 'AMRO': gradingStyle.color = 'blue'; break;
            case 'EMRO': gradingStyle.color = 'red'; break;
            case 'EURO': gradingStyle.color = 'brown'; break;
            case 'WPRO': gradingStyle.color = 'yellow'; break;
          }
        }
        return gradingStyle;

      }
    })
    this.colorFeatureLayer.addTo(map)

  }

  // gets the minimum zoom level and bounds according to screen resolution.
  getBoundsAndMinzoom(): { minZoom: number, bounds: L.LatLngTuple[] } {
    const maxScreenDimension = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
    // assuming tiles are 512 x 512
    const tileSize = 512;
    // Here the function used is the floor because world repeat not needed
    // Use Math.ceil if needed world repeat in future.
    const maxTiles = Math.floor(maxScreenDimension / tileSize);

    // Here the function used is the ceil because world repeat not needed
    // Use Math.floor if needed world repeat in future.
    let minZoom = Math.ceil(Math.log(maxTiles) / Math.log(2));
    console.log(maxTiles, minZoom, Math.log(maxTiles), Math.log(2));
    minZoom = minZoom - 0.7

    // only let minZoom be 2 or higher
    minZoom = minZoom < 2 ? 2 : minZoom;
    const bounds = [[90, 180] as L.LatLngTuple, [-90, -180] as L.LatLngTuple];

    return { minZoom, bounds }
  }
}