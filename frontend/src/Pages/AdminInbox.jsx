import AdminHeader from "../components/AdminHeader";
import AdminNav from "../components/AdminNav";
import supabase from "../supabaseClient";
import {useEffect, useState} from "react";  

function AdminInbox() {

  //messages holds all messages and selectedMessage is only the one chosen. openMessage is the function parameter. 
  // The clicked message receives the name messageToOpen temporarily and then is stored as selectedMessage, the currently displayed message

  //Sores messages retrieved from db table
  const [messages, setMessages] = useState([]);
  
  //Store currently opened message
  const [selectedMessage, setSelectedMessage] = useState(null);

  //Stores admin's response to customer message
  const [response, setResponse] = useState("");

  //Stores an error message if the message can't be fetched
  const [fetchError, setFetchError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  //Track whether message is currently being archived
  const [archiveLoading, setArchiveLoading] = useState(false);





  //Open a message and change its status from unread to read
  const openMessage = async (messageToOpen) => {

    //Open popup
    setSelectedMessage(messageToOpen);

    //Display saved response, or empty if no response yet
    setResponse(messageToOpen.admin_response || "");

    //Do not update a message that is already read or sent
    if (messageToOpen.status !== "unread") {
      return;
    }
    
    const openedTime = new Date().toISOString();

    //Update message in db
    const {error: statusError} = await supabase
      .from("messages")
      .update({
        status: "read",
        opened_at: openedTime,
      })
      .eq("id", messageToOpen.id);

      if (statusError) {
        console.error("Error updating message status:", statusError);
        setError("Could not mark this message as read.");
        return;
      }

      //Create updated copy of the message
      const updatedMessage = {
        ...messageToOpen,
        status: "read",
        opened_at: openedTime,
      };

      //Update popup and inbox tile
      setSelectedMessage(updatedMessage);

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
        message.id === messageToOpen.id ? updatedMessage : message
    )
  );
};







//Delete currently opened message (archive)
const archiveMessage = async () => {

  //Have admin confirm deletion
  const confirmed = window.confirm(
    "Are you sure you want to delete this message?"
  );

  if (!confirmed) {
    return;
  }



  setError ("");
  setArchiveLoading(true);


  const {error: archiveError } = await supabase
    .from("messages")
    .update({
      archived: true,
    })
    .eq("id", selectedMessage.id);

  if (archiveError) {
    console.error("Error archiving message:", archiveError);
    setError("Could not delete this message.");
      setArchiveLoading(false);
      return;
    
  }

  //Remove archived message from the admin inbox
  setMessages((currentMessages) =>
    currentMessages.filter(
      (message) => message.id !== selectedMessage.id
    )
  );

  //Close opened message popup
  setSelectedMessage(null);

  setArchiveLoading(false);

};



  const dBAddItem = async () => {

    setSuccess("");
    setError("");

    if (!response) {
      setError("Please enter a response");
      return;
    }

    setLoading(true);



    //Create admin response object
    const responseData = {
      response: response,
    };

      try {
        const response = await fetch(`http://localhost:3000/api/messages/${selectedMessage.id}/response`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(responseData),
        });

        const result = await response.json();
        console.log("Backend response:", result);

        if (!response.ok) {
          setError(result.message || "Failed to send response");
          return;
        }

        //Show success message after the email is sent and saved
        setSuccess("Response sent successfully!");

        //Update the opened message with the row returned by the backend. admin_response now contains text so the button disappears
        setSelectedMessage(result.updatedMessage);

        //Update the inbox message stored in react messages array so reopening this message does not require a refresh
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
          message.id === result.updatedMessage.id
            ? result.updatedMessage
            : message
          )
        );

      
        // Clear form after a delay. Don't allow double submission
        setLoading(false);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not reach backend");
      }
      finally {
      setLoading(false);
    }
  
};




  //Fetch customer messages
  useEffect(() => {
    const fetchMessagess = async () => {
        const { data, error } = await supabase
          .from("messages")
          .select(
            "id, customer_name, customer_email, subject, message, status, admin_response, created_at"
          )
          .eq("archived", false)
          .order("created_at", {ascending: false});

          if (error) {
            console.log("Error fetching messages", error);
            setFetchError("Could not load messages. Please try again");
            return;
          }

          //Store returned messages in state
          setMessages(data || []);
    
        };

        fetchMessagess();
      }, []);


  


  return (
    <div className="min-h-screen pb-16"> {/* Container for the AdminProducts page */}
      
      <AdminHeader /> {/*Logo and profile button*/}
      
      <div className="flex flex-col justify-left mt-8 ml-8 md:ml-13 text-white mr-8 md:mr-13">

        <h1 className="text-3xl md:text-5xl font-serif">
          Your Messages
        </h1>


        {fetchError && (
          <p className="mt-6 text-red-300">
            {fetchError}
          </p>
        )}



        {/* Message list section */}
        <div className= "flex flex-col justify-left mt-6">
          {messages.map((message) => ( //Map through the messages array and render each message
            
            <div
              key={message.id} //Unique key for each message
              onClick={() => openMessage(message)}
              className= "block hover:scale-[1.02] transition duration-200"
            >

              <div className="mb-6 w-full min-h-18 md:min-h-25 p-4 rounded-lg bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white flex items-center justify-between cursor-pointer">


            {/* Customer's inital*/}
            <div className="w-16 h-14 md:w-20 md:h-20 bg-white/20 rounded-sm mr-4 flex items-center justify-center text-xl md:text-3xl">
              {message.customer_name?.[0]?.toUpperCase() || "?"}
            </div>


            {/* Customer's name and subject*/}
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-lg md:text-3xl font-medium truncate">
                {message.customer_name}
              </p>

              <p className="text-lg md:text-2xl text-white/70 truncate">
                {message.subject}
              </p>
            </div>
           

            {/* Status*/}
            <span
              className={`text-md md:text-xl whitespace-nowrap capitalize ${
                message.status === "unread"
                  ? "text-[#8B6B4A]"
                  : "text-white"
              }`}
            >
              
              {message.status}
            </span>
          </div>
        </div>


      ))}

    </div>

          





 {/*Contact form popup */}
  {selectedMessage && (
   <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60">
      <div className="min-h-full flex justify-center pt-16 pb-8 md:pt-12 md:pb-12">
        <div className="w-full max-w-lg h-fit rounded-lg bg-[#C5AE98] p-8">
        <button
          type="button"
          onClick={() => setSelectedMessage(null)}
          className="float-right text-2xl text-white cursor-pointer"
        >
          ×
        </button>
        
          <h2 className="text-4xl md:text-4xl text-center font-serif text-white">
            Respond to Customer
          </h2>
          
          <div className="w-full max-w-md mx-auto px-6 py-4 pb-4 md:pb-12 rounded-2xl md:border md:border-white/30 md:shadow-lg bg-[#C5AE98]/20 backdrop-blur-lg md:mt-8 md:mb-8"> 
            <div className="space-y-4">

              <div>

                <label className="block text-lg md:text-xl text-white mb-2">
                  Name
                </label>

                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value = {selectedMessage.customer_name} 
                  readOnly
                />

              </div>

              <div>

                <label className="block text-lg md:text-xl text-white mb-2">
                  Email
                </label>

                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value = {selectedMessage.customer_email} 
                  readOnly               
                  />

              </div>

              <div>

                <label className="block text-lg md:text-xl text-white mb-2">
                  Subject
                </label>

                <input
                  placeholder="Value"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none"
                  value = {selectedMessage.subject} 
                  readOnly                
                  />

              </div>

              <div>

                <label className="block text-lg md:text-xl text-white mb-2">
                  Message
                </label>

                <textarea
                  placeholder="Enter your message"
                  rows="4"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none resize-none"
                  value = {selectedMessage.message} 
                  readOnly                
                  />

              </div>

              <div>

                <label className="block text-lg md:text-xl text-white mb-2">
                  Response
                </label>

                <textarea
                  placeholder="Enter your response"
                  rows="4"
                  className="w-full bg-white rounded-lg px-3 py-2 text-gray-700 placeholder-gray-400 outline-none resize-none"
                  value = {response} 
                  onChange={(e) => setResponse(e.target.value)}  
                  readOnly={Boolean(selectedMessage.admin_response)}             
                />

              </div>


              
              {/* Display success or error messages */}
              {error && (
                <p className="text-red-600 text-lg md:text-xl text-center">{error}</p>
              )}

              {success && (
                <p className="text-green-600 text-lg md:text-xl text-center">{success}</p>
              )}


              {!selectedMessage.admin_response && (
              <button onClick ={dBAddItem}
                disabled={loading}
                className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-[#8B6B4A] backdrop-blur-lg border border-white/30 shadow-sm text-white text-lg md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
                }`}
                >
                  {loading ? "Sending Response..." : "Send Response"
                }
          
              </button>
              )}


              
              {/*Delete product functionality goes here*/}
              <button 
                onClick ={archiveMessage}
                disabled={archiveLoading}
                className={`mt-8 w-full py-2 md:h-10 rounded-lg bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-lg md:text-xl flex items-center justify-center hover:scale-105 cursor-pointer transition ${
                  archiveLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"
                }`}
                >
                  {archiveLoading ? "Deleting Message..." : "Delete Message"
                }
          
              </button>




            </div>
            </div>
          </div>
        </div>
      </div>
    )}

  </div>


      {!selectedMessage && <AdminNav />}
        
  </div>
  );
}

export default AdminInbox;
