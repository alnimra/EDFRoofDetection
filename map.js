
function initMap() {
	// Create a map object and specify the DOM element for display.
	var map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 8.6737621, lng: 40.4768358 },
		zoom: 17
	});
}

initMap();
