import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';

import { Router } from '@angular/router';
import * as L from 'leaflet';
import { HostelService } from '../hostel.service';

@Component({
  selector: 'app-create-hostel',
  templateUrl: './create-hostel.component.html',
  styleUrls: ['./create-hostel.component.css']
})
export class CreateHostelComponent implements AfterViewInit, OnDestroy {

  @ViewChild('propertyMap')
  propertyMap!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private marker!: L.Marker;

  private readonly defaultLatitude = 17.3850;
  private readonly defaultLongitude = 78.4867;

  // LOCATION CONTROLS

  showLocationMap = false;
  addressSearch = '';

  locationMessage =
    'Choose your property location using the Pick Location button.';

  searchingAddress = false;
  gettingLocation = false;
  hasSelectedLocation = false;

  private locationRequestId = 0;

  // RENTAL PROPERTY OPTIONS

  rentalTypes: string[] = [
    '1 BHK',
    '2 BHK',
    '3 BHK',
    '4 BHK',
    'Studio Apartment',
    'Independent House'
  ];

  furnishingTypes: string[] = [
    'Unfurnished',
    'Semi-Furnished',
    'Fully-Furnished'
  ];

  rentalFeatures: string[] = [
    'Parking',
    'Lift',
    'Power Backup',
    'Security',
    'CCTV',
    'Wi-Fi',
    'Air Conditioning',
    'Water Heater',
    'RO Water',
    'Balcony',
    'Garden',
    'Swimming Pool',
    'Gym',
    'Washing Machine',
    'Kitchen',
    'Refrigerator'
  ];

  // HOSTEL SHARING

  sharing: number[] = [2, 3, 4, 5, 6];

  selectedShare: number | null = null;

  sharePrice = 0;
  shareVacancy = 0;

  servicesList: string[] = [
    'Wi-Fi',
    'Washing Machine',
    'Food',
    'AC',
    'Non-AC',
    'Parking',
    'Power Backup',
    'Water Heater',
    'RO Water',
    'House Keeping',
    'Security/CCTV',
    'Lift',
    '24/7 Water',
    'Study Room',
    'TV',
    'Gym'
  ];

  selectedServices: string[] = [];

  // PROPERTY DATA

  hostel: any = this.getEmptyProperty();

  private getEmptyProperty(): any {
    return {
      name: '',
      area: '',
      address: '',
      type: 'boys',

      roomSharing: [],
      services: [],
      vacancy: 0,

      roomType: '',
      bedrooms: null,
      bathrooms: null,
      rent: null,
      deposit: 0,
      builtUpArea: null,
      floor: null,
      furnishing: '',
      preferredTenants: '',
      features: [],

      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    };
  }

  // IMAGE AND VIDEO UPLOAD

  sharingImages: File[] = [];
  sharingVideos: File[] = [];

  sharingImagePreviews: string[] = [];
  sharingVideoPreviews: string[] = [];

  submitting = false;

  // MAP MARKER ICON

  private markerIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        font-size:34px;
        color:#f4511e;
        text-shadow:0 2px 4px #777;
      ">📍</div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 38],
    popupAnchor: [0, -36]
  });

  constructor(
    private hostelService: HostelService,
    private router: Router
  ) {}

  // COMPONENT INITIALIZATION

  ngAfterViewInit(): void {
    // Map initializes only after clicking Pick Location.
  }

  // OPEN LOCATION MAP

  openLocationMap(): void {

    this.showLocationMap = true;

    setTimeout(() => {

      if (!this.propertyMap?.nativeElement) {
        return;
      }

      if (!this.map) {
        this.initializeMap();
      } else {

        this.map.invalidateSize();

        if (this.hasSelectedLocation) {

          const latitude =
            this.hostel.location.coordinates[1];

          const longitude =
            this.hostel.location.coordinates[0];

          this.marker.setLatLng([latitude, longitude]);

          this.map.setView(
            [latitude, longitude],
            16
          );
        }
      }

    }, 300);
  }

  // CLOSE LOCATION MAP

  closeLocationMap(): void {

    this.showLocationMap = false;

    if (!this.hasSelectedLocation) {
      this.locationMessage =
        'No location selected. Click Pick Location to try again.';
    }
  }

  // CONFIRM LOCATION

  confirmLocation(): void {

    if (!this.hasSelectedLocation) {
      alert('Please select a location on the map.');
      return;
    }

    this.showLocationMap = false;

    this.locationMessage =
      'Property location confirmed successfully.';
  }

  // MAP INITIALIZATION

  private initializeMap(): void {

    if (!this.propertyMap?.nativeElement || this.map) {
      return;
    }

    this.map = L.map(
      this.propertyMap.nativeElement
    ).setView(
      [this.defaultLatitude, this.defaultLongitude],
      12
    );

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }
    ).addTo(this.map);

    this.marker = L.marker(
      [this.defaultLatitude, this.defaultLongitude],
      {
        draggable: true,
        icon: this.markerIcon
      }
    ).addTo(this.map);

    this.marker.bindPopup(
      'Drag this pin or click the map to select your property.'
    );

    this.map.on(
      'click',
      (event: L.LeafletMouseEvent) => {

        this.setMapLocation(
          event.latlng.lat,
          event.latlng.lng,
          'Location selected from map.'
        );

      }
    );

    this.marker.on('dragend', () => {

      const position = this.marker.getLatLng();

      this.setMapLocation(
        position.lat,
        position.lng,
        'Location updated by moving the map pin.'
      );

    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 300);
  }

  // SET SELECTED MAP LOCATION

  private setMapLocation(
    latitude: number,
    longitude: number,
    message: string
  ): void {

    if (!this.map || !this.marker) {
      return;
    }

    const requestId = ++this.locationRequestId;

    this.marker.setLatLng([
      latitude,
      longitude
    ]);

    this.map.setView(
      [latitude, longitude],
      16,
      { animate: true }
    );

    this.hostel.location = {
      type: 'Point',
      coordinates: [
        Number(longitude.toFixed(7)),
        Number(latitude.toFixed(7))
      ]
    };

    this.hasSelectedLocation = true;
    this.locationMessage = message;

    this.marker
      .bindPopup(
        `Selected Property Location<br>
        Latitude: ${latitude.toFixed(6)}<br>
        Longitude: ${longitude.toFixed(6)}`
      )
      .openPopup();

    this.getAddressFromCoordinates(
      latitude,
      longitude,
      requestId
    );
  }

  // LIVE GPS LOCATION

  getLiveLocation(): void {

    if (!navigator.geolocation) {

      this.locationMessage =
        'GPS is not supported by this browser.';

      return;
    }

    this.gettingLocation = true;

    this.locationMessage =
      'Getting your current location...';

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.setMapLocation(
          latitude,
          longitude,
          'Your current GPS location has been selected.'
        );

        this.gettingLocation = false;
      },

      (error) => {

        this.gettingLocation = false;

        switch (error.code) {

          case error.PERMISSION_DENIED:
            this.locationMessage =
              'Location permission denied. Please allow location access in your browser.';
            break;

          case error.POSITION_UNAVAILABLE:
            this.locationMessage =
              'Your current location is unavailable. Try searching or selecting the map.';
            break;

          case error.TIMEOUT:
            this.locationMessage =
              'Location request timed out. Please try again.';
            break;

          default:
            this.locationMessage =
              'Unable to get your location.';
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  // SEARCH ADDRESS

  async searchAddress(): Promise<void> {

    const searchText = this.addressSearch.trim();

    if (!searchText) {

      this.locationMessage =
        'Please enter an area or address to search.';

      return;
    }

    if (!this.map) {
      this.locationMessage =
        'Please open the map first.';
      return;
    }

    this.searchingAddress = true;

    this.locationMessage =
      'Searching for your location...';

    try {

      const url =
        'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
        encodeURIComponent(searchText);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Address search failed.');
      }

      const results = await response.json();

      if (!results || results.length === 0) {

        this.locationMessage =
          'Location not found. Try entering a more specific address.';

        return;
      }

      const result = results[0];

      this.setMapLocation(
        Number(result.lat),
        Number(result.lon),
        'Location selected from your address search.'
      );

      this.hostel.address =
        result.display_name || searchText;

    } catch (error) {

      console.error('Address search error:', error);

      this.locationMessage =
        'Unable to search location. Please check your internet connection.';

    } finally {

      this.searchingAddress = false;
    }
  }

  // ENTER KEY SEARCH

  onAddressSearchKey(event: KeyboardEvent): void {

    if (event.key === 'Enter') {
      event.preventDefault();
      this.searchAddress();
    }
  }

  // REVERSE GEOCODING

  private async getAddressFromCoordinates(
    latitude: number,
    longitude: number,
    requestId: number
  ): Promise<void> {

    try {

      const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

      const response = await fetch(url);

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (requestId !== this.locationRequestId) {
        return;
      }

      if (result && result.address) {

        const address = result.address;

        this.hostel.area =
          address.suburb ||
          address.neighbourhood ||
          address.city_district ||
          address.town ||
          address.city ||
          address.village ||
          '';

        this.hostel.address =
          result.display_name || '';
      }

    } catch (error) {

      console.error(
        'Reverse geocoding error:',
        error
      );
    }
  }

  // PROPERTY TYPE

  changePropertyType(type: string): void {

    this.hostel.type = type;

    if (type === 'room') {

      this.selectedShare = null;
      this.sharePrice = 0;
      this.shareVacancy = 0;

    } else {

      this.hostel.roomType = '';
      this.hostel.bedrooms = null;
      this.hostel.bathrooms = null;
      this.hostel.rent = null;
      this.hostel.deposit = 0;
      this.hostel.builtUpArea = null;
      this.hostel.floor = null;
      this.hostel.furnishing = '';
      this.hostel.preferredTenants = '';
      this.hostel.features = [];
    }
  }

  // RENTAL FEATURES

  toggleRentalFeature(
    feature: string,
    event: Event
  ): void {

    const checked =
      (event.target as HTMLInputElement).checked;

    if (checked) {

      if (!this.hostel.features.includes(feature)) {
        this.hostel.features.push(feature);
      }

    } else {

      this.hostel.features =
        this.hostel.features.filter(
          (item: string) => item !== feature
        );
    }
  }

  // HOSTEL SHARING

  selectSharing(sharing: number): void {

    this.selectedShare = sharing;

    const existing =
      this.hostel.roomSharing.find(
        (item: any) => item.sharing === sharing
      );

    this.sharePrice = existing?.price || 0;
    this.shareVacancy = existing?.vacancy || 0;
  }

  setSharePrice(): void {

    if (this.selectedShare === null) {
      return;
    }

    const index =
      this.hostel.roomSharing.findIndex(
        (item: any) =>
          item.sharing === this.selectedShare
      );

    if (index >= 0) {

      this.hostel.roomSharing[index].price =
        Number(this.sharePrice);

    } else {

      this.hostel.roomSharing.push({
        sharing: this.selectedShare,
        price: Number(this.sharePrice),
        vacancy: Number(this.shareVacancy)
      });
    }
  }

  setShareVacancy(): void {

    if (this.selectedShare === null) {
      return;
    }

    const index =
      this.hostel.roomSharing.findIndex(
        (item: any) =>
          item.sharing === this.selectedShare
      );

    if (index >= 0) {

      this.hostel.roomSharing[index].vacancy =
        Number(this.shareVacancy);

    } else {

      this.hostel.roomSharing.push({
        sharing: this.selectedShare,
        price: Number(this.sharePrice),
        vacancy: Number(this.shareVacancy)
      });
    }

    this.hostel.vacancy =
      this.hostel.roomSharing.reduce(
        (total: number, item: any) =>
          total + Number(item.vacancy || 0),
        0
      );
  }

  // HOSTEL SERVICES

  toggleService(
    service: string,
    event: Event
  ): void {

    const checked =
      (event.target as HTMLInputElement).checked;

    if (checked) {

      if (!this.selectedServices.includes(service)) {
        this.selectedServices.push(service);
      }

    } else {

      this.selectedServices =
        this.selectedServices.filter(
          item => item !== service
        );
    }

    this.hostel.services = [
      ...this.selectedServices
    ];
  }

  // IMAGE UPLOAD

  onSharingImagesSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files = Array.from(input.files);

    const validFiles = files.filter(
      file => file.type.startsWith('image/')
    );

    this.sharingImages = [
      ...this.sharingImages,
      ...validFiles
    ];

    this.refreshPreviews('image');

    input.value = '';
  }

  // VIDEO UPLOAD

  onSharingVideosSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files = Array.from(input.files);

    const validFiles = files.filter(
      file => file.type.startsWith('video/')
    );

    this.sharingVideos = [
      ...this.sharingVideos,
      ...validFiles
    ];

    this.refreshPreviews('video');

    input.value = '';
  }

  // PREVIEW GENERATION

  private refreshPreviews(
    type: 'image' | 'video'
  ): void {

    if (type === 'image') {

      this.revokeUrls(this.sharingImagePreviews);

      this.sharingImagePreviews =
        this.sharingImages.map(
          file => URL.createObjectURL(file)
        );

    } else {

      this.revokeUrls(this.sharingVideoPreviews);

      this.sharingVideoPreviews =
        this.sharingVideos.map(
          file => URL.createObjectURL(file)
        );
    }
  }

  private revokeUrls(urls: string[]): void {

    urls.forEach(url => {
      URL.revokeObjectURL(url);
    });
  }

  // REMOVE IMAGE

  removeSharingImage(index: number): void {

    this.sharingImages.splice(index, 1);

    this.refreshPreviews('image');
  }

  // REMOVE VIDEO

  removeSharingVideo(index: number): void {

    this.sharingVideos.splice(index, 1);

    this.refreshPreviews('video');
  }

  // PREPARE HOSTEL DATA FOR BACKEND

  private preparePropertyData(): any {

    const roomSharing = this.hostel.type === 'room'
      ? []
      : (this.hostel.roomSharing || []);

    // Convert sharing array into an object:
    // { "2": 5000, "3": 4000 }
    const roomSharingMap: Record<string, number> = {};

    // Convert vacancy into an object:
    // { "2": 3, "3": 2 }
    const vacancyMap: Record<string, number> = {};

    roomSharing.forEach((item: any) => {

      const sharingKey = String(item.sharing);

      roomSharingMap[sharingKey] =
        Number(item.price || 0);

      vacancyMap[sharingKey] =
        Number(item.vacancy || 0);
    });

    return {
      ...this.hostel,

      // Owner ID is intentionally NOT sent.
      // Backend reads authenticated owner from JWT.

      roomSharing: roomSharingMap,
      vacancy: vacancyMap,

      services: this.hostel.type === 'room'
        ? []
        : [...this.selectedServices],

      features: this.hostel.type === 'room'
        ? [...this.hostel.features]
        : []
    };
  }

  // CREATE HOSTEL

  createHostel(): void {

    if (this.submitting) {
      return;
    }

    if (!this.hostel.name?.trim()) {
      alert('Please enter property name.');
      return;
    }

    if (
      !this.hostel.area?.trim() ||
      !this.hostel.address?.trim()
    ) {
      alert('Please enter the property area and full address.');
      return;
    }

    if (!this.hasSelectedLocation) {
      alert('Please select the property location using Pick Location.');
      return;
    }

    const coordinates =
      this.hostel.location?.coordinates || [];

    if (
      coordinates.length !== 2 ||
      !Number.isFinite(Number(coordinates[0])) ||
      !Number.isFinite(Number(coordinates[1])) ||
      (Number(coordinates[0]) === 0 &&
       Number(coordinates[1]) === 0)
    ) {
      alert('Please select a valid map location.');
      return;
    }

    // RENTAL ROOM VALIDATION

    if (this.hostel.type === 'room') {

      if (
        !this.hostel.roomType ||
        this.hostel.bedrooms === null ||
        this.hostel.bedrooms === undefined ||
        this.hostel.bathrooms === null ||
        this.hostel.bathrooms === undefined ||
        !this.hostel.rent ||
        Number(this.hostel.rent) <= 0 ||
        !this.hostel.furnishing
      ) {
        alert('Please complete all required rental room details.');
        return;
      }

    } else {

      // HOSTEL VALIDATION

      if (this.selectedShare === null) {
        alert('Please select a hostel sharing type.');
        return;
      }

      this.setSharePrice();
      this.setShareVacancy();

      const selectedSharing =
        this.hostel.roomSharing.find(
          (item: any) =>
            item.sharing === this.selectedShare
        );

      if (
        !selectedSharing ||
        Number(selectedSharing.price) <= 0
      ) {
        alert('Please enter the monthly sharing price.');
        return;
      }

      if (Number(selectedSharing.vacancy) < 0) {
        alert('Please enter a valid vacancy.');
        return;
      }
    }

    this.submitting = true;

    const propertyData = this.preparePropertyData();

    const formData = new FormData();

    formData.append(
      'hostel',
      JSON.stringify(propertyData)
    );

    // Append media files

    if (this.hostel.type !== 'room') {

      this.sharingImages.forEach(file => {
        formData.append('sharingImages', file);
      });

      this.sharingVideos.forEach(file => {
        formData.append('sharingVideos', file);
      });
    }

    this.hostelService.createHostel(formData).subscribe({

      next: (response: any) => {

        this.submitting = false;

        // Support common response structures.
        const hostelId =
          response?.data?._id ||
          response?.data?.hostel?._id ||
          response?.hostel?._id ||
          response?._id ||
          response?.hostelId;

        if (!hostelId) {

          console.error(
            'Hostel created, but hostel ID was not returned:',
            response
          );

          alert(
            'Hostel creation response did not include a hostel ID. ' +
            'Please check your backend add-hostel response.'
          );

          return;
        }

        alert(
          'Hostel created successfully. Please select a subscription plan to publish your listing.'
        );

        // IMPORTANT:
        // Do not reset the form before navigation.
        // The newly created hostel remains unpublished until payment is verified.

        this.router.navigate(
          ['/subscription-plans'],
          {
            queryParams: {
              hostelId: hostelId
            }
          }
        );
      },

      error: (error: any) => {

        this.submitting = false;

        console.error(
          'Create property error:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to create property. Please try again.'
        );
      }
    });
  }

  // RESET FORM

  resetForm(): void {

    this.locationRequestId++;

    this.hostel = this.getEmptyProperty();

    this.selectedShare = null;
    this.sharePrice = 0;
    this.shareVacancy = 0;

    this.selectedServices = [];

    this.hasSelectedLocation = false;

    this.addressSearch = '';

    this.showLocationMap = false;

    this.searchingAddress = false;
    this.gettingLocation = false;

    this.locationMessage =
      'Choose your property location using the Pick Location button.';

    this.revokeUrls(this.sharingImagePreviews);
    this.revokeUrls(this.sharingVideoPreviews);

    this.sharingImages = [];
    this.sharingVideos = [];

    this.sharingImagePreviews = [];
    this.sharingVideoPreviews = [];

    if (this.marker && this.map) {

      this.marker.setLatLng([
        this.defaultLatitude,
        this.defaultLongitude
      ]);

      this.map.setView(
        [
          this.defaultLatitude,
          this.defaultLongitude
        ],
        12
      );

      this.marker.closePopup();
    }
  }

  // BACK BUTTON

  historyBack(): void {
    window.history.back();
  }

  // COMPONENT DESTROY

  ngOnDestroy(): void {

    this.locationRequestId++;

    this.revokeUrls(this.sharingImagePreviews);
    this.revokeUrls(this.sharingVideoPreviews);

    if (this.map) {
      this.map.remove();
    }
  }
}