const mapBoxContainer = document.querySelector('#mapbox');
const totalContainer = document.querySelector('#total');
const downloadBtn = totalContainer.querySelector('.download');
let map = null;

const setPopupBody = (id) => {
	return `
		<div class="popup__body">
			<h1 class="popup__title">Marker ${id + 1}</h1>
			<h2 class="popup__title popup__title-small">Set marker rating:</h2>

			<button class="popup__btn" data-score="0">0</button>
			<button class="popup__btn" data-score="1">1</button>
			<button class="popup__btn" data-score="2">2</button>
			<button class="popup__btn" data-score="3">3</button>
			<button class="popup__btn" data-score="4">4</button>
			<button class="popup__btn" data-score="5">5</button>

			<div class="remove">Remove marker</div>
		</div>
	`;
}

let mapbox = {
	TOKEN: 'pk.eyJ1IjoiYmFyYmFyb3NzczI1IiwiYSI6ImNrNGlqZW80cDBtZjQzbnB3cTJubHBlOXIifQ.vWMSzqU8pN6agv4uo_tnGw',
	initCoordinates: {
		lng: 24.03188079550128,
		lat: 49.840928523982654
	},
	markersArray: [],

	init() {
		mapboxgl.accessToken = this.TOKEN;

		map = new mapboxgl.Map({
			container: mapBoxContainer,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: [this.initCoordinates.lng, this.initCoordinates.lat],
			zoom: 12
		});
	},

	onClickMap() {
		map.on('click', (e) => {
			const target = e.originalEvent.target;
			const coords = e.lngLat;

			if (target && !target.classList.contains('marker')) {
				if (this.markersArray.length < 5) {
					this.marker.createMarker(coords);
				}
			}
		});
	},

	createHTMLDiv(className) {
		const htmlDiv = document.createElement('div');
		htmlDiv.classList.add(className);

		return htmlDiv;
	},

	update() {
		this.onClickMap();
	},

	start() {
		this.init();
		this.update();
	}
}



mapbox.marker = {
	markerCounter: 0,
	createMarker({ lng, lat }) {
		const markerElement = mapbox.createHTMLDiv('marker');
		markerElement.id = `marker_${this.markerCounter}`;
		markerElement.style.backgroundColor = 'orangered';

		const marker = new mapboxgl.Marker(markerElement, {
			draggable: true
		})
			.setLngLat([lng, lat])
			.setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(setPopupBody(this.markerCounter)))
			.addTo(map);

		marker.togglePopup();
		mapbox.markersArray.push({
			...marker,
			id: markerElement.id,
			score: 0,
			backgroundColor: markerElement.style.backgroundColor
		});

		this.initMarkerDependencies(marker);
		++this.markerCounter;

	},

	initMarkerDependencies(marker) {
		if (mapbox.markersArray.length) {
			this.updateMarker(marker);
			this.deleteMarker(marker);
			this.updateMarkersDesk(marker);
		}
	},

	updateMarker(marker) {
		if (mapbox.markersArray.length) {
			marker.on('dragend', () => {
				const lngLat = marker.getLngLat();

				mapbox.markersArray.forEach(item => {
					if (item._element.id === marker._element.id) {
						item._lngLat = lngLat;
					}
				});
			});
		}
	},

	updateMarkersDesk(marker) {
		mapbox.markersArray.forEach(item => {
			if (item._element.id === marker._element.id) {
				const markersWrap = totalContainer.querySelector('.total_markers');
				const markerID = +item._element.id.match(/\d+/);
				const HTMLItem = `<div class="${item._element.id}">Marker ${markerID + 1}: <span>${item.score}</span></div>`;

				if (markersWrap.querySelector(`.${item._element.id}`)) {
					markersWrap.querySelector(`.${item._element.id} span`).textContent = item.score;
				} else {
					markersWrap.insertAdjacentHTML('beforeend', HTMLItem);
				}

				this.updateTotalScore();
			}
		});
	},

	updateMarkerState(marker, color, score) {
		mapbox.markersArray.forEach(item => {
			if (item._element.id === marker._element.id) {
				const index = mapbox.markersArray.indexOf(item);
				mapbox.markersArray[index].backgroundColor = color;
				mapbox.markersArray[index].score = score;

				this.updateMarkersDesk(item);
			}
		})
	},

	updateTotalScore() {
		const totalField = totalContainer.querySelector('.total span');
		const totalSum = mapbox.markersArray.reduce((sum, marker) => sum + marker.score, 0);

		totalField.textContent = totalSum;
	},

	changeMarkerColor(marker) {
		const popupBody = document.querySelector('.popup__body');
		const scoreBtns = popupBody.querySelectorAll('.popup__btn');

		scoreBtns.forEach(btn => {
			btn.addEventListener('click', (e) => {
				scoreBtns.forEach(button => button.classList.remove('active'));
				e.target.classList.add('active');

				const btnScore = e.target.getAttribute('data-score');
				switch (btnScore) {
					case '0':
						marker._element.style.backgroundColor = 'black';
						this.updateMarkerState(marker, 'black', 0);
						break;

					case '1':
						marker._element.style.backgroundColor = 'gray';
						this.updateMarkerState(marker, 'gray', 0);
						break;

					case '2':
						marker._element.style.backgroundColor = 'red';
						this.updateMarkerState(marker, 'red', 10);
						break;

					case '3':
						marker._element.style.backgroundColor = 'orange';
						this.updateMarkerState(marker, 'orange', 10);
						break;

					case '4':
						marker._element.style.backgroundColor = 'lime';
						this.updateMarkerState(marker, 'lime', 30);
						break;

					case '5':
						marker._element.style.backgroundColor = 'green';
						this.updateMarkerState(marker, 'green', 50);
						break;

					default:
						break;
				}
			});
		});
	},

	deleteMarker(marker) {
		setTimeout(() => {
			const popupBody = document.querySelector('.popup__body');

			if (popupBody) {
				const deleteBtn = popupBody.querySelector('.remove');

				deleteBtn.addEventListener('click', () => {
					mapbox.markersArray.forEach(item => {
						if (item._element.id === marker._element.id) {
							const index = mapbox.markersArray.indexOf(item);

							if (index > -1) {
								mapbox.markersArray.splice(index, 1);
								const totalItem = totalContainer.querySelector(`.${item._element.id}`);
								totalItem.remove();
								this.updateTotalScore();
							}

							marker.remove();
						}
					});
				});

				this.changeMarkerColor(marker);
			}
		}, 100);
	},
};



window.addEventListener('DOMContentLoaded', () => {
	mapbox.start();

	downloadBtn.addEventListener('click', () => {
		const download = (filename, text) => {
			var element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
			element.setAttribute('download', filename);

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		}

		const arr = mapbox.markersArray.map(item => {
			const { id, score, backgroundColor, _lngLat } = item;
			const newObj = { id, score, backgroundColor, _lngLat };

			return newObj;
		});

		let text = JSON.stringify(arr);

		download('markers.txt', text);
	});
});

