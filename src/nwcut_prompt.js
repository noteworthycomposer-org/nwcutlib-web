import {h,createProjector} from 'maquette';

const projector = createProjector();

// before maquette: 247kb (gzip 82009 bytes)
// after maquette: 257.1kb (gzip 85699 bytes)
function nwcut_prompt(msg,  datatype, v3, v4,callbackFunc) {
	let listvals = (datatype == '|') ? v3 : false;
	let defaultval = listvals ? v4 : v3;
	function doValChange(e) { defaultval = e.target.value; }
	function doSubmit(e) {
		let dlg = document.querySelector('dialog.nwcut');
		dlg.close();
		projector.detach(renderprompt);
		dlg.remove();
		e.preventDefault();
		callbackFunc(defaultval);
	}
	function renderprompt() {
		return h('dialog.nwcut',[
			h('form',{onsubmit: doSubmit}, [
				h('label', [
					msg,
					h('input', {type: 'text', value: defaultval, oninput: doValChange})
				]),
				h('button',{type: 'submit'}, ['Submit'])
			])
		]);
	}
	projector.append(document.body, renderprompt);
	document.querySelector('dialog.nwcut').showModal();
}

function nwcut_prompt_promise(msg,  datatype, v3, v4) {
	return new Promise((resolve) => {
		nwcut_prompt(msg,  datatype, v3, v4, (r) => {
			resolve(r)
		});
	});
}

module.exports = { nwcut_prompt, nwcut_prompt_promise }