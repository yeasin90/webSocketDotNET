var WDApp = function () {
    var self = this;
    self.ws = {};

    self.onopne = function () {
        $(".connStatus").html("connected");
    };

    self.onmessage = function (event) {

        if (event.data instanceof ArrayBuffer) {
            var binary = '';
            var bytes = new Uint8Array(event.data);
            for (var i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            // Add image
            $(".note").find("ul").append("<li><span class=\"unchecked\"></span><span class=\"todo\"><img src=\"data:image/png");
        }

        var returnAction = JSON.parse(event.data);

        //alert(returnAction.Message);

        if (returnAction.Action == "new") {
            $(".note").find("ul").append("<li><span class=\"unchecked\"></span><span class=\"todo\">"
                + returnAction.Message + "</span><span class=\"delete\"></span></li>");
        } else if (returnAction.Action == "check") {
            var item = $("ul").find("li:nth-child(" + (parseInt(returnAction.Message) + 1) + ")").find("span:first");
            item.removeClass("unchecked");
            item.addClass("checked");
        } else if (returnAction.Action == "uncheck") {
            var item = $("ul").find("li:nth-child(" + (parseInt(returnAction.Message) + 1) + ")").find("span:first");
            item.removeClass("checked");
            item.addClass("unchecked");
        } else if (returnAction.Action == "delete") {
            var item = $("ul").find("li:nth-child(" + (parseInt(returnAction.Message) + 1) + ")");
            item.remove();
        }

        //$(".connStatus").html("connection error");
    };

    self.onerror = function (evt) {
        $(".connStatus").html("disconnected");
    };

    self.onclose = function (evt) {

    };

    self.init = function () {
        var port = window.location.port;
        if ('WebSocket' in window) {
            self.ws = new WebSocket("ws://" + window.location.hostname + ":" + (port == "" ? "80" : port) + "/api/WebSocket")
        } else if ('MozWebSocket' in window) {
            self.ws = new WebSocket("ws://" + window.location.hostname + ":" + (port == "" ? "80" : port) + "/api/WebSocket")
        } else {
            return;
        }

        self.ws.binaryType = "arraybuffer";
        $(".connStatus").html("connecting....");
        self.setupSocketEvents();
        self.setupDomEvents();
    };

    self.send = function (action, message) {
        if (self.ws.readyState == WebSocket.OPEN) {
            var str = JSON.stringify({
                Action: action,
                Message: message
            });
            self.ws.send(str);
        }
    };

    self.close = function () {

    };

    self.setupDomEvents = function () {

        $("#add_image").change(function (event) {
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer($("#add_image")[0].files[0]);
            fileReader.onload = function (e) {
                self.ws.send(e.target.result);
            };
        });
        $(document.body).delegate("span.delete", "click", function () {
            var pos = $(this).parent().index();
            self.send("delete", pos);
        });
        $(document.body).delegate("span.checked", "click", function () {
            var pos = $(this).parent().index();
            self.send("uncheck", pos);
        });
        $(document.body).delegate("span.unchecked", "click", function () {
            var pos = $(this).parent().index();
            self.send("check", pos);
        });
        $(".new_todo").keydown(function (event) {
            if (event.keyCode == 13) {
                var message = $(this).val();
                if (message != "")
                    self.send("new", message);

                $(".new_todo").val("");
                return false;
            }
        });
    }

    self.setupSocketEvents = function () {
        self.ws.onopen = function (evt) { self.onopne(evt); };
        self.ws.onmessage = function (evt) { self.onmessage(evt); };
        self.ws.onerror = function (evt) { self.onerror(evt); };
        self.ws.onclose = function (evt) { self.onclose(evt); };
    }
}