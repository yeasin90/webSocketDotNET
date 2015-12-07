using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebSocketNET.Models
{
    public class NoteModel
    {
        public bool IsChecked { get; set; }
        public string ToDo { get; set; }
        public byte[] ImageData { get; set; }
    }
}