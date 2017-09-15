document.addEventListener("DOMContentLoaded", event => {

    let header = document.createElement('div')
    // HOW TO USE SHADOWDOM?
    , root = header.createShadowRoot() 
    , div = document.createElement('div')
    , head = document.head
    , style = document.createElement('style')
    , font = document.createElement('script')
    , jsFunctions = document.createElement('script');

    // IMPORT AWESOMEFONT ICONS
    font.src = "https://use.fontawesome.com/009740555a.js";
    
    // SETUP HEADER CSS
    style.innerHTML = `    
            .header {
                width: 100%;
                height: 25px;
                min-height: 25px;
                display: flex;
                align-content: center;
                vertical-align: middle;
                background: #DEE3E8;
                background-position: 6px 1px;
                -webkit-app-region: drag;
            }
            .header-title{
                padding: 0px 4px;
                vertical-align: middle;
                -webkit-app-region: no-drag
            }
            .openfin-chrome__header-controls-container {
                -webkit-app-region: drag;        
            }
            .openfin-chrome__header-controls {
                -webkit-app-region: no-drag;
                list-style: none;
                position: absolute;
                right: 8px;
                padding-left: 0;
                margin: 6px 0;
            }
            .openfin-chrome__header-control {
                display: inline-block;
                cursor: pointer;
                line-height: 25px;
                padding: 0 4px;
            }
            .icon{
                color: #3B3C3A;
                font-size: 14px;
            }   
    `
    // SETUP HEADER HTML
    div.innerHTML= `        
        <div class="header">
            <span class="header-title">
                <img src="http://localhost:8080/symphony.png" height="25">
            </span>
            <div class="openfin-chrome__header-controls-container">
                <ul class="openfin-chrome__header-controls">
                    <li class="openfin-chrome__header-control">
                        <a onclick="fin.desktop.Window.getCurrent().minimize()"><i class="fa fa-minus icon"></i></a>
                    </li>
                    <li class="openfin-chrome__header-control">
                        <a onclick="maximizeOrRestore(maximized)"><i class="fa fa-square-o icon" id="maxOrRestore"></i></a>
                    </li>
                    <li class="openfin-chrome__header-control openfin-chrome__header-control--close">
                        <a onclick="fin.desktop.Application.getCurrent().close()"><i class="fa fa-close icon"></i></a>
                    </li>
                </ul>
            </div>
        </div>
    `
    
    // SETUP JAVASCRIPT FOR HEADER
    jsFunctions.innerHTML = `
        let win = fin.desktop.Window.getCurrent();
        let app = fin.desktop.Application.getCurrent();
        let maximized = false;
        setTimeout(()=> {win.getState(state => {
            console.log(state)
            if (state === 'maximized') {
                let iconToChange = document.getElementById('maxOrRestore');            
                iconToChange.classList.toggle('fa-square-o');
                iconToChange.classList.toggle('fa-window-restore');
                maximized = true;
            }
        })},1000) 
        const maximizeOrRestore = (max) => {
            max ? win.restore() : win.maximize();
            let iconToChange = document.getElementById('maxOrRestore');
            iconToChange.classList.toggle('fa-square-o');
            iconToChange.classList.toggle('fa-window-restore');
            maximized = !maximized;
        }
    `
    
    // INJECT INTO THE PAGE
    root.appendChild(font);
    root.appendChild(style);
    root.appendChild(jsFunctions);
    root.appendChild(div);
    document.body.insertBefore(header, document.body.firstChild);
});