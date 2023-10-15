import {h, setChildren, mount, unmount} from 'redom';


// before maquette: 247kb (gzip 82009 bytes)
// after maquette: 257.1kb (gzip 85699 bytes)
// then switch to redom: 253.7 kb
function buildDataControl(datatype,v3,v4) {
	let listvals = (datatype[0] == '&') ? v3 : false;
	let defaultval = listvals ? v4 : v3;

	switch (datatype[0]) {
		case '*':
			// indicates a text response
			return h('input', {type: 'number', value: defaultval});
		case '_':
			// indicates a multi-line text response
			return h('textarea', {rows: 6, cols: 50}, defaultval);
		case '#':
			// indicates a numeric/integer response; the range and spin value can be specified in brackets (e.g. "#[-2,5,1]" supports values from -2 through 5, by 1)
			return h('input', {type: 'number', value: defaultval});
		case '|': { // indicates a list of items, each separated by a vertical bar (e.g. "|Note|Bar|Rest" contains a list of three elements)
			let vlist = datatype.substring(1).split('|');
			let valist = vlist.map((v) => h('option',{value:v},v));
			return h('select', valist);
		}
		case '&': { // indicates a list of multi-selectable items, which are provided in the listvals parameter; the default must be a table of strings pre-selected strings from
			let valist = listvals.map((v) => h('option',{value:v},v));
			return h('select', {multiple:true}, valist);
		}
	}

	return h('input', {type: 'text', value: defaultval});
}

function nwcut_prompt(msg,datatype,v3,v4,callbackFunc) {
	let el_val = buildDataControl(datatype,v3,v4);
	let dlg = h('dialog.nwcut',
		h('form',{onsubmit: doSubmit},
			h('label', msg, el_val),
			h('button',{type: 'submit'}, 'Submit')
		)
	);

	function doSubmit(e) {
		let rval = el_val.value;
		dlg.close();
		unmount(document.body, dlg);
		e.preventDefault();
		callbackFunc(rval);
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