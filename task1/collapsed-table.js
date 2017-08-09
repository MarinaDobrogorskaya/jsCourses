;(function () {

    function generateTable(options){
        var table = create('table');
        table.id = 'double-collapsed-table';
        var trs = generateByTagName(options.rows, 'tr', 0);
        for(var i = 0; i < trs.length; i++){
            var tds = generateByTagName(options.cols, 'td', 0);
            appendAll(trs[i], tds);
        }
        appendAll(table, trs);
        addContent(table, options.generateContent);
        addColsHeaders(table, options.cols);
        addRowsHeaders(table, options.rows);
        document.getElementById(options.target).appendChild(table);
        addClickListeners();
    }
    function addClickListeners() {
        var ths = document.getElementsByTagName('th');
        for (var i = 0; i < ths.length; i++) {
            ths[i].addEventListener('click', function (event) {
                event.stopPropagation();
                var dataInfo = JSON.parse(this.getAttribute('data-info'));
                if(dataInfo.children){
                    var id = dataInfo.id;
                    var ids = getAllIds(dataInfo.children);
                    var idsWithChildren = getAllIds(dataInfo.children, true);
                    if(hasClass(this, 'opened')){
                        this.classList.remove('opened');
                        hideOrShowByClasses(idsWithChildren, true);
                        openOrCloseByClasses([id], false);
                        openOrCloseByClasses(idsWithChildren, false);
                    } else {
                        this.classList.add('opened');
                        hideOrShowByClasses(ids, false);
                        openOrCloseByClasses([id], true);
                    }
                }
            });
        }
    }
    function hideOrShowByClasses(classes, isHideOperation){
        for(var i = 0; i < classes.length; i++) {
            var elems = document.getElementsByClassName(prepareClass(classes[i]));
            for(var iEl = 0; iEl < elems.length; iEl++){
                if(isHideOperation) {
                    elems[iEl].classList.add('hide');
                } else {
                    elems[iEl].classList.remove('hide');
                }
            }
        }
    }
    function openOrCloseByClasses(classes, isOpenOperation){
        for(var i = 0; i < classes.length; i++) {
            var elems = document.getElementsByClassName(prepareClass(classes[i]));
            for (var iEl = 0; iEl < elems.length; iEl++) {
                if (isOpenOperation) {
                    elems[iEl].classList.add('opened');
                } else {
                    elems[iEl].classList.remove('opened');
                }
            }
        }
    }
    function hasClass(elem, _class) {
        return elem.classList.contains(_class);
    }
    function getAllIds(arr, withChildren){
        var result = [];
        for(var i = 0; i < arr.length; i++){
            result.push(arr[i].id);
            if(withChildren && arr[i].children){
                var subIds = getAllIds(arr[i].children, withChildren);
                result = result.concat(subIds);
            }
        }
        return result;
    }
    function addContent(table, func){
        var trs = table.getElementsByTagName('tr');
        for(var iTr = 0; iTr < trs.length; iTr++){
            var rowObj = JSON.parse(trs[iTr].getAttribute('data-info'));
            var tds = trs[iTr].getElementsByTagName('td');
            for(var iTd = 0; iTd < tds.length; iTd++){
                var colObj = JSON.parse(tds[iTd].getAttribute('data-info'));
                tds[iTd].appendChild(func(rowObj, colObj));
            }
        }
    }
    function addRowsHeaders(table, arr){
        var emptyTd = create('td');
        var ths = generateByTagName(arr, 'th', 0);
        var trs = table.getElementsByTagName('tr');
        prepend(trs[0], emptyTd);
        for(var i = 1; i < trs.length; i++){
            ths[i - 1].innerText = JSON.parse(ths[i - 1].getAttribute('data-info')).name;
            prepend(trs[i], ths[i - 1]);
        }
    }
    function addColsHeaders(table, arr){
        var tr = create('tr');
        var ths = generateByTagName(arr, 'th', 0);
        for(var i = 0; i < ths.length; i++){
            ths[i].innerText = JSON.parse(ths[i].getAttribute('data-info')).name;
        }
        appendAll(tr, ths);
        prepend(table, tr);
    }
    function generateByTagName(arr, tagName, deep, isAddHide){
        var result = [];
        for(var i = 0; i < arr.length; i++){
            var el = create(tagName);
            addClass(el, tagName + '-' + deep);
            if(isAddHide){
                addClass(el, 'hide');
            }
            addClass(el, prepareClass(arr[i].id));
            el.setAttribute('data-info', JSON.stringify(arr[i]));
            result.push(el);
            if(arr[i].children){
                var subResult = generateByTagName(arr[i].children, tagName, deep + 1, true);
                result = result.concat(subResult);
            }
        }
        return result;
    }
    function prepend(target, elem){
        target.insertBefore(elem, target.children ? target.children[0] : null);
    }
    function appendAll(target, arr){
        for(var i = 0; i < arr.length; i++){
            target.appendChild(arr[i]);
        }
    }
    function prepareClass(_class){
        return _class.replace(/\./g,'-');
    }
    function addClass(target, _class){
        target.className += target.className ? ' ' + _class : _class;
    }
    function create(tagName){
        return document.createElement(tagName);
    }

    window.COLLAPSED = {
        generateTable: generateTable,
        prepareClass: prepareClass,
        create: create
    };

})();

