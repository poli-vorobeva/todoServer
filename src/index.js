import multiparty from 'multiparty'
import * as http from "http";

const port = process.env.PORT || 5000;
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
const filesData = {}

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
	if (method === 'GET') {
		response.write(JSON.stringify(Object.values(data)))
		response.end()
	}
	if (method === 'POST') {
		if (url.slice(1) === 'modify') {//add edit
			let form = new multiparty.Form()
			form.parse(request, function (err, fields, files) {
				const filesNames = files.file?.map(f => f.originalFilename)
				files.file?.forEach(file => {
					filesData[file.originalFilename] = file
				});
				if (data[fields.id[0]]) {
					Object.entries(fields).forEach(f => {
						data[fields.id[0]][f[0]] = f[1]
					})
					const newFiles=files.file?.map(e=>e.originalFilename)||[]
					data[fields.id[0]].files=[...data[fields.id[0]].files,...newFiles]
					response.write(JSON.stringify(Object.values(data)))
					response.end()
					return
				}
				if (!data[fields.id[0]]) {
					data[fields.id[0]] = {...fields, files: filesNames || []}
					response.write(JSON.stringify(Object.values(data)))
					response.end()
				}

			})
		}
		else if (url.slice(1) === 'delete') {
			doRequest(request).then(r => {
				const delId = JSON.parse(r).data
				delete data[delId]
				response.write(JSON.stringify(Object.values(data)))
				response.end()
			})
		}
		else if (url.slice(1) === 'status') {
			doRequest(request).then(r => {
				const payload = JSON.parse(r)
				data[payload.data.id].status = payload.data.status
				response.write(JSON.stringify(Object.values(data)))
				response.end()
			})
		}
		else if (url.slice(1) === 'file') {
			doRequest(request).then(r => {
				const payload = JSON.parse(r)
				data[payload.data.id].files =
					data[payload.data.id].files.slice().filter(e => e !== payload.data.file)
				//console.log(data,'DDDD')
				response.write(JSON.stringify(Object.values(data)))
				response.end()
			})
		}
		else if(url.slice(1)==='missed'){
			doRequest(request).then(r => {
				const missedIds = JSON.parse(r)
				console.log(missedIds,'$')
				missedIds.forEach(id=>{
					if(!id) return
					data[id].status='missed'
				})
				response.write(JSON.stringify(Object.values(data)))
				response.end()
			})
		}
	}
};

const server = http.createServer(requestHandler);
server.listen(port, () => {
	console.log(`server is listening on ${port}`);
});
