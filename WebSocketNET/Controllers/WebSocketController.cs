using Microsoft.ServiceModel.WebSockets;
using Microsoft.Web.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Script.Serialization;
using WebSocketNET.Models;

namespace WebSocketNET.Controllers
{
    public class WebSocketController : ApiController
    {
        private static WebSocketCollection connections = new WebSocketCollection();

        public HttpResponseMessage Get()
        {
            if (HttpContext.Current.IsWebSocketRequest)
            {
                var noteHandler = new NoteSocketHandler();
                HttpContext.Current.AcceptWebSocketRequest(noteHandler);
            }

            return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
        }

        internal class NoteSocketHandler : WebSocketHandler
        {
            public NoteSocketHandler()
            {

            }

            public override void OnClose()
            {
                connections.Remove(this);
            }

            public override void OnError()
            {
                connections.Remove(this);
            }

            public override void OnOpen()
            {
                connections.Add(this);
            }

            public override void OnMessage(byte[] message)
            {
                MvcApplication.Notes.Add(new NoteModel() { IsChecked = false, ToDo = "", ImageData = message });

                foreach (var connection in connections)
                {
                    connection.Send(message);
                }
            }

            public override void OnMessage(string message)
            {
                NoteSocketAction socketAction = new JavaScriptSerializer().Deserialize<NoteSocketAction>(message);
                var notes = MvcApplication.Notes;

                if (socketAction.Action == "new")
                {
                    notes.Add(new NoteModel() { IsChecked = false, ToDo = socketAction.Message });
                }
                else if (socketAction.Action == "delete")
                {
                    notes.RemoveAt(Convert.ToInt32(socketAction.Message));
                }
                else if (socketAction.Action == "check")
                {
                    notes.ElementAt(Convert.ToInt32(socketAction.Message)).IsChecked = true;
                }
                else if (socketAction.Action == "uncheck")
                {
                    notes.ElementAt(Convert.ToInt32(socketAction.Message)).IsChecked = false;
                }

                string retunrAction = new JavaScriptSerializer().Serialize(socketAction);

                foreach (var connection in connections)
                {
                    connection.Send(retunrAction);
                }
            }
        }
    }
}
