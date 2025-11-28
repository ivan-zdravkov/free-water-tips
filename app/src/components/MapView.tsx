// For native platforms, we'll use the web implementation via WebView
// This ensures consistent OpenStreetMap rendering across all platforms
export { default } from './MapView.web';
export { MapView, Marker, PROVIDER_DEFAULT, Region } from './MapView.web';
