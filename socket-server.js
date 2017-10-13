var MessagePack = require('msgpack-lite');

var AWSregion = 'us-west-2';
//var aws_access_key_id = "<your AWS access Key ID>";
//var aws_secret_access_key = "<your AWS secret access key>";
var queueURL = 'https://sqs.us-west-2.amazonaws.com/623680212266/sqsTest0';

var AWS = require('aws-sdk');
//AWS.config.update({accessKeyId: aws_access_key_id, secretAccessKey: aws_secret_access_key});
AWS.config.update({});
AWS.config.update({region: AWSregion});

var sqs = new AWS.SQS();
var params = {};

var deleteReceiptHandle = "";
var clientData = {};
clientData.id = 0;
clientData.text = "";
clientData._map = [];

var params = {
	AttributeNames: ["SentTimestamp"],
	MessageAttributeNames: ["All"],
	QueueUrl: queueURL,
	MaxNumberOfMessages: 1, // how many messages do we want to retrieve?
	VisibilityTimeout: 60, // seconds - how long we want a lock on this job
	WaitTimeSeconds: 20 // seconds - how long should we wait for a message?
};

//start the socket io server on port 8889
var SocketServer = require('socket.io')(8889);

// Heartbeat and status server for AWS health checks http on port 3000
const http = require('http')
const port = 3000

const requestHandler = (request, response) => {
  console.log(request.url);
  response.end('OK');
}

const server = http.createServer(requestHandler)
server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
})

SocketServer.on('connection', function(io) {
	console.log("connection");
	var checkSQSDelayMs = 1000;

	function emitMessage (clientId){
		io.emit("message", MessagePack.encode(clientData));
	}

	function deleteMessage(){
		var deleteParams = {
			QueueUrl: queueURL,
			ReceiptHandle: deleteReceiptHandle
		};

		sqs.deleteMessage(deleteParams, function(err, data) {
			if (err) {
				console.log("Delete Error", err);
			} else {
				console.log("Message Deleted", data);
			}
		});
	}

	function getSQSMessage()
	{
		sqs.receiveMessage(params, function(err, data){
			if(err) {
				console.log("err:" + err);
				data.Messages = [];
				data.Messages[0] = err;
			}
			//if we get data from AWS
			if(data)
			{
				console.log("SQS data: " + JSON.stringify(data));
				// If there are any messages
				if (data.Messages)
				{
					// Get the first message (should be the only one since we said to only get one above)
					var message = data.Messages[0];
					if(message.Body){
						//console.log(message.Body);
						if(message.ReceiptHandle)
						{
							deleteReceiptHandle = message.ReceiptHandle;
						}
						clientData.id += 1;
						clientData.text = message.Body;

						//Broadcast messages back to the clients
						emitMessage();
						//delete the message from the queue
						deleteMessage();
					}
				}
			}
			else {
				console.log("no data from AWS");
			}
		});
	}

  //every checkSQSDelayMs wake up and check for a message
	setInterval(function(){getSQSMessage()}, checkSQSDelayMs);
});
