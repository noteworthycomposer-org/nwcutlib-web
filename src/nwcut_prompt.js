
function nwcut_prompt(msg,  datatype, v3, v4,callbackFunc) {
	let listvals = (datatype == '|') ? v3 : false;
	let defaultval = listvals ? v4 : v3;
	let c_dlg = document.createElement('dialog');
	let c_form = c_dlg.appendChild(document.createElement('form'));
	let c_label = document.createElement('label');
	let c_input = document.createElement('input');
	c_label.setAttribute('for',c_input.getAttribute('id'));
	c_form.appendChild(c_label);
	c_form.appendChild(c_input);
	let c_ok = c_form.appendChild(document.createElement('button'));
	c_dlg.className = 'nwcut';
	c_label.textContent = msg;
	c_input.type = 'text';
	c_input.value = defaultval;
	c_ok.type = 'submit';
    c_ok.textContent = 'Submit';
	document.body.appendChild(c_dlg);
	c_form.addEventListener('submit', (e) => {
		e.preventDefault();
		let r = c_input.value;
		c_dlg.remove();
		c_dlg = null;
		callbackFunc(r);
	});
	c_dlg.showModal();
}

function nwcut_prompt_promise(msg,  datatype, v3, v4) {
	return new Promise((resolve) => {
		nwcut_prompt(msg,  datatype, v3, v4, (r) => {
			resolve(r)
		});
	});
}

module.exports = { nwcut_prompt, nwcut_prompt_promise }