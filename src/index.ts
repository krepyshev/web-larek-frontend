import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';

import { Api } from './components/base/api';

const api = new Api(API_URL);

api
	.get('/product/b06cde61-912f-4663-9751-09956c0eed67')
	.then((result) => console.log(result));
