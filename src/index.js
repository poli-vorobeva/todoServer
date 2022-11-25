
import * as http from "http";
const port =   process.env.PORT || 5000;
const data = {
	[Date.now()]: {
		title: 'Task one',
		description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur culpa illum nat',
		files: [],
		time: '',
		date: '',
		status: 'open',
		id: Date.now()
	},
	[Date.now() - 10]: {
		title: 'Task one',
		description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur culpa illum nat',
		files: [],
		time: '',
		date: '',
		status: 'open',
		id: Date.now() - 10
	}
}

function doRequest(request) {
	let body = ''
	return new Promise((res, rej) => {
		request.on('data', (chunk) => {
			body += chunk;
		});
		request.on('end', () => {
			res((body));
		});
		request.on('error', (err) => {
			rej(err);
		});
	});
}

const requestHandler = (request, response) => {
	const {method, url} = request
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Credentials", "true");
	response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	console.log(method,'!!!!!')
	if (method === 'GET') {
//res.setEncoding('utf8');
		response.write(JSON.stringify(Object.values(data)))
		response.end()
	}
	if (method === 'POST') {
		doRequest(request).then((r) => {
			if (url.slice(1)) {//delete
				const payload=JSON.parse(r)
				payload.action==='delete'
				? delete data[url.slice(1)]
				:data[url.slice(1)].status=payload.data.status


			} else {//add task
				const task = JSON.parse(r)
				data[task.id] = task
			}
			response.write(JSON.stringify(Object.values(data)))
			response.end()
		})
	}
	if (method === 'PUT') {
		console.log("&&&&&&")
		doRequest(request).then((r) => {
			console.log(r,'!!@@!@')
			const status = r
			data[url.slice(1)]=status
			response.write(JSON.stringify(data[url.slice(1)]))
			response.end()
		})
	}
};

const server = http.createServer(requestHandler);
server.listen(port, () => {
	console.log(`server is listening on ${port}`);
});