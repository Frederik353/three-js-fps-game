

class Input{
    constructor(){
        this._keyMap = {};
        this.events = [];

        this.AddKeyDownListner(this._onKeyDown);
        this.AddKeyUpListner(this._onKeyUp);
    }

    _addEventListner(element, type, callback){
        element.addEventListener(type, callback);
        this.events.push({element, type, callback});
    }

    AddKeyDownListner(callback){
        this._addEventListner(document, 'keydown', callback);
    }

    AddKeyUpListner(callback){
        this._addEventListner(document, 'keyup', callback);
    }

    AddMouseMoveListner(callback){
        this._addEventListner(document, 'mousemove', callback);
    }

    AddClickListner(callback){
        var canvas = document.getElementById("canvas1");
        this._addEventListner(canvas, 'click', callback);
    }

    AddMouseWheelListener(callback){
        this._addEventListner(document, 'wheel', callback);
    }

    AddMouseDownListner(callback){
        this._addEventListner(document.body, 'mousedown', callback);
    }

    AddMouseUpListner(callback){
        this._addEventListner(document.body, 'mouseup', callback);
    }

    _onKeyDown = (event) => {
        this._keyMap[event.code] = 1;
    }

    _onKeyUp = (event) => {
        this._keyMap[event.code] = 0;
    }

    GetKeyDown(code){
        return this._keyMap[code] === undefined ? 0 : this._keyMap[code];
    }

    ClearEventListners(){
        this.events.forEach(e=>{
            e.element.removeEventListener(e.type, e.callback);
        });

        this.events = [];
        this.AddKeyDownListner(this._onKeyDown);
        this.AddKeyUpListner(this._onKeyUp);
    }

    OnPointerlockChange = () => {
        if (document.pointerLockElement) {
            this.isLocked = true;
            return;
        }

        this.isLocked = false;
    }
}

const inputInstance = new Input();
export default inputInstance;