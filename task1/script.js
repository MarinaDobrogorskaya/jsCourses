var features = [
    { id: 'all.f', name: 'all features', children: [
        {id: 'administrative', name: 'all administrative areas', children: [
            {id: 'administrative.country', name: 'countries'},
            {id: 'administrative.land_parcel', name: 'land parcels'},
            {id: 'administrative.locality', name: 'localities'},
            {id: 'administrative.neighborhood', name: 'neighborhoods'},
            {id: 'administrative.province', name: 'provinces'}
        ]},
        {id: 'landscape', name: 'all landscapes', children:[
            {id: 'landscape.man_made', name: 'structures built by humans'},
            {id: 'landscape.natural', name: 'natural features'},
            {id: 'landscape.natural.landcover', name: 'landcover features'},
            {id: 'landscape.natural.terrain', name: 'terrain features'}
        ]},
        {id: 'poi', name: 'all points of interest', children:[
            {id: 'poi.attraction', name: 'tourist attractions'},
            {id: 'poi.business', name: 'businesses'},
            {id: 'poi.government', name: 'government buildings'},
            {id: 'poi.medical', name: 'emergency services'},
            {id: 'poi.park', name: 'parks'},
            {id: 'poi.place_of_worship', name: 'places of worship'},
            {id: 'poi.school', name: 'schools'},
            {id: 'poi.sports_complex', name: 'sports complexes'}
        ]},
        {id: 'road', name: 'all roads', children:[
            {id: 'road.arterial', name: 'arterial roads'},
            {id: 'road.highway', name: 'highways'},
            {id: 'road.highway.controlled_access', name: 'highways with controlled access'},
            {id: 'road.local', name: 'local roads'}
        ]},
        {id: 'transit', name: 'all transit stations and lines', children:[
            {id: 'transit.line', name: 'transit lines'},
            {id: 'transit.station', name: 'all transit stations'},
            {id: 'transit.station.airport', name: 'airports'},
            {id: 'transit.station.bus', name: 'bus stops'},
            {id: 'transit.station.rail', name: 'rail stations'}
        ]},
        {id: 'water', name: 'bodies of water'}
    ]}
];
var elements = [
    {id: 'all.e', name: 'all', children: [
        {id: 'geometry', name: 'geometry', children: [
            {id: 'geometry.fill', name: 'fill'},
            {id: 'geometry.stroke', name: 'stroke'}
        ]},
        {id: 'labels', name: 'labels', children:[
            {id: 'labels.icon', name: 'icon'},
            {id: 'labels.text', name: 'text', children: [
                {id: 'labels.text.fill', name: 'text fill'},
                {id: 'labels.text.stroke', name: 'text stroke'}
            ]}
        ]}
    ]}
];

var map;


function initMap() {
    var options = {
        zoom: 8,
        center: {
            lat: 30, lng: 50
        }
    };
    try {
        map = new google.maps.Map(document.getElementById('map'), options);
    } catch (ReferenceError){}
    
    navigator.geolocation.getCurrentPosition(function(position){
        if(map){
            options.center = {
                lat: position.coords.latitude, lng: position.coords.longitude
            };
            map.setOptions(options);
        }
    });
}

function getAllCollapsedInputs(){
    var collapsedInputs = document.getElementById('collapsed-inputs');
    return collapsedInputs.getElementsByTagName('input');
}

function addCollapsedInputsChangeListeners(){
    var allInputs = getAllCollapsedInputs();
    for(var i = 0; i < allInputs.length; i++){
        allInputs[i].addEventListener('change', function(event){
            event.stopPropagation();
            if(this.type === 'color') {
                this.classList.add('changed');
                this.parentNode.children[0].checked = true;
            }
            disableOrEnableButton();
            var newStyles = getStyledArray();
            changeMap(newStyles);
        });
    }
}


function addDownloadClickListener() {
    document.getElementById('json-btn').addEventListener('click', function(){
        var styles = JSON.stringify(getStyledArray());
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob([styles], {type: 'application/json'}));
        a.download = 'styles.json';
        document.body.appendChild(a)
        a.click();
        document.body.removeChild(a)
    });
}

function getStyledArray() {
    var checkedInputs = document.querySelectorAll('input:checked');
    var result = [];
    for(var i = 0; i < checkedInputs.length; i++){
        if(checkedInputs[i].parentNode.parentNode.classList.contains('hide') ||
            checkedInputs[i].parentNode.parentNode.parentNode.classList.contains('hide')){
            continue;
        }
        var value = checkedInputs[i].parentNode.children[1].value;
        var featureType = JSON.parse(checkedInputs[i].parentNode.getAttribute('feature-type'));
        var elementType = JSON.parse(checkedInputs[i].parentNode.getAttribute('element-type'));
        result.push({
            featureType: featureType.id,
            elementType: elementType.id,
            stylers: [
                { color: value }
            ]
        })
    }
    return result;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomStyles(){
    var inputs = document.querySelectorAll('#collapsed-inputs input');
    for(var i = 0; i < inputs.length; i++){
        if(inputs[i].type === 'checkbox') {
            inputs[i].checked = true;
        } else if(inputs[i].type === 'color') {
            inputs[i].parentNode.children[1].value = getRandomColor();
        }
    }
}

function resetStyles(){
    var inputs = document.querySelectorAll('#collapsed-inputs input');
    for(var i = 0; i < inputs.length; i++){
        if(inputs[i].type === 'checkbox') {
            inputs[i].checked = false;
        } else if(inputs[i].type === 'color') {
            inputs[i].parentNode.children[1].value = '#000000';
        }
    }
}

function setStyledArray(arr){
    for(var i = 0; i < arr.length; i++){
        var trClass = COLLAPSED.prepareClass(arr[i].featureType);
        var tdClass = COLLAPSED.prepareClass(arr[i].elementType);
        var color = arr[i].stylers[0].color;
        var td = document.querySelector('.' + trClass + ' .' + tdClass);
        td.children[0].children[0].checked = true;
        td.children[0].children[1].value = color;
    }
}

function onready(){
    initMap();
    COLLAPSED.generateTable({
        target: 'collapsed-inputs',
        rows: features,
        cols: elements,
        generateContent: function(featureType, elementType){
            var colorInput = COLLAPSED.create('input');
            colorInput.type = 'color';
            var checkboxInput = COLLAPSED.create('input');
            checkboxInput.type = 'checkbox';
            var div = COLLAPSED.create('div');
            div.setAttribute('feature-type', JSON.stringify(featureType));
            div.setAttribute('element-type', JSON.stringify(elementType));
            div.appendChild(checkboxInput);
            div.appendChild(colorInput);
            return div;
        }
    });
    rebuildSelect();
    addCollapsedInputsChangeListeners();
    addSaveBtnClickListenter();
    addDownloadClickListener();
}
document.addEventListener('DOMContentLoaded', onready);

function disableOrEnableButton() {
    var checkboxes = document.querySelectorAll('input:checked');
    var button = document.getElementById('save-btn');
    if(checkboxes.length !== 0){
        button.removeAttribute('disabled')
    } else {
        button.setAttribute('disabled', 'true');
    }
}
function rebuildSelect(){
    var div = document.getElementById('dinamic-select');
    var oldSelect = div.children;
    if(oldSelect.length !== 0) {
        oldSelect[0].remove();
    }
    var select = document.createElement('select');
    var isFirst = true;
    for(var key in localStorage){
        if(localStorage.hasOwnProperty(key)) {
            var option = document.createElement('option');
            option.value = localStorage[key];
            option.innerText = key;
            select.appendChild(option);
            if(isFirst){
                isFirst = false;
                var style = JSON.parse(localStorage[key]);
                setStyledArray(style);
                changeMap(style);
            }
        }
    }
    if(select.children.length !== 0) {
        div.appendChild(select);
        addSelectChangeListener();
    }
}

function changeMap(newStyles) {
    var int = setInterval(function () {
        if(map) {
            map.setOptions({
                styles: newStyles
            });
            clearInterval(int);
        }
    }, 1000);
}

function addSelectChangeListener(){
    document.getElementById('dinamic-select').children[0].addEventListener('change', function (event) {
        var someStyles = JSON.parse(this.value);
        resetStyles();
        setStyledArray(someStyles);
        changeMap(someStyles);
    });
}

function addSaveBtnClickListenter() {
    var button = document.getElementById('save-btn');
    button.addEventListener('click', function () {
        var name = document.getElementById('name-of-style').value;
        if(!name){
            return;
        }
        var styles = JSON.stringify(getStyledArray());
        localStorage.setItem(name, styles);
        rebuildSelect();
    });
}