import React from 'react';
import { render } from 'react-dom';

import Component from '../../src';

class Demo extends React.Component {
	render() {
		return (
			<div>
				<h1>{{ name }} Demo</h1>
				<Component />
			</div>
		);
	}
}

render(<Demo />, document.querySelector('#demo'));
