/*******************************************************************************
* Utilities                                                                    *
*******************************************************************************/

function createWebSocket(path) {
    var host = window.location.hostname;
    if(host == '') host = 'localhost';
    var uri = 'ws://' + host + ':8000' + path;
    return new WebSocket(uri);
}

function runTest(name, test) {
    var div = $(document.createElement('div'));
    $('#results').append(div);

    var title = $(document.createElement('h2'));
    title.attr('id', name);
    title.text(name);
    div.append(title);

    var ol = $(document.createElement('ol'));
    div.append(ol);

    function addItem(str) {
        var li = $(document.createElement('li'));
        li.text(str);
        ol.append(li);
    }

    try {
        test(function(assert, result) {
            addItem(assert + ': ' + (result ? '✓' : '✗'));
        });
    } catch(err) {
        addItem('Crashed: ' + err.message + ' ');
    }
}

/*******************************************************************************
* Actual tests                                                                 *
*******************************************************************************/

function demo(assert) {
    assert('Hi', true);
    assert('O', false);
    assert('Sup', true);
}

function echo(assert) {
    var ws = createWebSocket('/echo');
    var messages = ['Hi folks', 'Hello there', 'What up'];

    ws.onopen = function() {
        ws.send(messages[0]);
    };

    ws.onmessage = function (event) {
        var message = event.data;
        assert('equal', message == messages[0]);
        messages = messages.slice(1);
        if(messages.length > 0) ws.send(messages[0]);
        else ws.close();
    };
}

function closeme(assert) {
    var ws = createWebSocket('/closeme');
    ws.onopen = function() {
        ws.send('Close me!');
    };
    ws.onclose = function() {
        assert('closed', true);
    };
}

/*******************************************************************************
* Entry point                                                                  *
*******************************************************************************/

$(document).ready(function() {
    runTest('demo', demo);
    runTest('echo', echo);
    runTest('closeme', closeme);
})
