import {h, setChildren, mount, unmount} from 'redom';


// before maquette: 247kb (gzip 82009 bytes)
// after maquette: 257.1kb (gzip 85699 bytes)
// then switch to redom: 253.7 kb
function nwcut_prompt(msg,  datatype, v3, v4,callbackFunc) {
	let listvals = (datatype == '|') ? v3 : false;
	let defaultval = listvals ? v4 : v3;
	let dlg = h('dialog.nwcut',
		h('form',{onsubmit: doSubmit},
			h('label', msg, 
				h('input', {type: 'text', value: defaultval, oninput: doValChange})
			),
			h('button',{type: 'submit'}, 'Submit')
		)
	);
	function doValChange(e) { defaultval = e.target.value; }
	function doSubmit(e) {
		dlg.close();
		unmount(document.body, dlg);
		e.preventDefault();
		callbackFunc(defaultval);
	}

	mount(document.body, dlg);
	dlg.showModal();
}

function nwcut_prompt_promise(msg,  datatype, v3, v4) {
	return new Promise((resolve) => {
		nwcut_prompt(msg,  datatype, v3, v4, (r) => {
			resolve(r)
		});
	});
}

module.exports = { nwcut_prompt, nwcut_prompt_promise }