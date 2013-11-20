if (typeof __$coverObject === "undefined"){
	if (typeof window !== "undefined") window.__$coverObject = {};
	else if (typeof global !== "undefined") global.__$coverObject = {};
	else throw new Error("cannot find the global scope");
}
var __$coverInit = function(name, code){
	if (!__$coverObject[name]) __$coverObject[name] = {__code: code};
};
var __$coverInitRange = function(name, range){
	if (!__$coverObject[name][range]) __$coverObject[name][range] = 0;
};
var __$coverCall = function(name, range){
	__$coverObject[name][range]++;
};
__$coverInit("Plupload", "/**\n * Plupload.js\n *\n * Copyright 2013, Moxiecode Systems AB\n * Released under GPL License.\n *\n * License: http://www.plupload.com/license\n * Contributing: http://www.plupload.com/contributing\n */\n\n/*global mOxie:true */\n\n;(function(window, o, undef) {\n\nvar delay = window.setTimeout\n, fileFilters = {}\n;\n\n// convert plupload features to caps acceptable by mOxie\nfunction normalizeCaps(settings) {\t\t\n\tvar features = settings.required_features, caps = {};\n\n\tfunction resolve(feature, value, strict) {\n\t\t// Feature notation is deprecated, use caps (this thing here is required for backward compatibility)\n\t\tvar map = { \n\t\t\tchunks: 'slice_blob',\n\t\t\tjpgresize: 'send_binary_string',\n\t\t\tpngresize: 'send_binary_string',\n\t\t\tprogress: 'report_upload_progress',\n\t\t\tmulti_selection: 'select_multiple',\n\t\t\tmax_file_size: 'access_binary',\n\t\t\tdragdrop: 'drag_and_drop',\n\t\t\tdrop_element: 'drag_and_drop',\n\t\t\theaders: 'send_custom_headers',\n\t\t\tcanSendBinary: 'send_binary',\n\t\t\ttriggerDialog: 'summon_file_dialog'\n\t\t};\n\n\t\tif (map[feature]) {\n\t\t\tcaps[map[feature]] = value;\n\t\t} else if (!strict) {\n\t\t\tcaps[feature] = value;\n\t\t}\n\t}\n\n\tif (typeof(features) === 'string') {\n\t\tplupload.each(features.split(/\\s*,\\s*/), function(feature) {\n\t\t\tresolve(feature, true);\n\t\t});\n\t} else if (typeof(features) === 'object') {\n\t\tplupload.each(features, function(value, feature) {\n\t\t\tresolve(feature, value);\n\t\t});\n\t} else if (features === true) {\n\t\t// check settings for required features\n\t\tif (!settings.multipart) { // special care for multipart: false\n\t\t\tcaps.send_binary_string = true;\n\t\t}\n\n\t\tif (settings.chunk_size > 0) {\n\t\t\tcaps.slice_blob = true;\n\t\t}\n\n\t\tif (settings.resize.enabled) {\n\t\t\tcaps.send_binary_string = true;\n\t\t}\n\t\t\n\t\tplupload.each(settings, function(value, feature) {\n\t\t\tresolve(feature, !!value, true); // strict check\n\t\t});\n\t}\n\t\n\treturn caps;\n}\n\n/** \n * @module plupload\t\n * @static\n */\nvar plupload = {\n\t/**\n\t * Plupload version will be replaced on build.\n\t *\n\t * @property VERSION\n\t * @for Plupload\n\t * @static\n\t * @final\n\t */\n\tVERSION : '@@version@@',\n\n\t/**\n\t * Inital state of the queue and also the state ones it's finished all it's uploads.\n\t *\n\t * @property STOPPED\n\t * @static\n\t * @final\n\t */\n\tSTOPPED : 1,\n\n\t/**\n\t * Upload process is running\n\t *\n\t * @property STARTED\n\t * @static\n\t * @final\n\t */\n\tSTARTED : 2,\n\n\t/**\n\t * File is queued for upload\n\t *\n\t * @property QUEUED\n\t * @static\n\t * @final\n\t */\n\tQUEUED : 1,\n\n\t/**\n\t * File is being uploaded\n\t *\n\t * @property UPLOADING\n\t * @static\n\t * @final\n\t */\n\tUPLOADING : 2,\n\n\t/**\n\t * File has failed to be uploaded\n\t *\n\t * @property FAILED\n\t * @static\n\t * @final\n\t */\n\tFAILED : 4,\n\n\t/**\n\t * File has been uploaded successfully\n\t *\n\t * @property DONE\n\t * @static\n\t * @final\n\t */\n\tDONE : 5,\n\n\t// Error constants used by the Error event\n\n\t/**\n\t * Generic error for example if an exception is thrown inside Silverlight.\n\t *\n\t * @property GENERIC_ERROR\n\t * @static\n\t * @final\n\t */\n\tGENERIC_ERROR : -100,\n\n\t/**\n\t * HTTP transport error. For example if the server produces a HTTP status other than 200.\n\t *\n\t * @property HTTP_ERROR\n\t * @static\n\t * @final\n\t */\n\tHTTP_ERROR : -200,\n\n\t/**\n\t * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.\n\t *\n\t * @property IO_ERROR\n\t * @static\n\t * @final\n\t */\n\tIO_ERROR : -300,\n\n\t/**\n\t * Generic I/O error. For exampe if it wasn't possible to open the file stream on local machine.\n\t *\n\t * @property SECURITY_ERROR\n\t * @static\n\t * @final\n\t */\n\tSECURITY_ERROR : -400,\n\n\t/**\n\t * Initialization error. Will be triggered if no runtime was initialized.\n\t *\n\t * @property INIT_ERROR\n\t * @static\n\t * @final\n\t */\n\tINIT_ERROR : -500,\n\n\t/**\n\t * File size error. If the user selects a file that is too large it will be blocked and an error of this type will be triggered.\n\t *\n\t * @property FILE_SIZE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_SIZE_ERROR : -600,\n\n\t/**\n\t * File extension error. If the user selects a file that isn't valid according to the filters setting.\n\t *\n\t * @property FILE_EXTENSION_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_EXTENSION_ERROR : -601,\n\n\t/**\n\t * Duplicate file error. If prevent_duplicates is set to true and user selects the same file again.\n\t *\n\t * @property FILE_DUPLICATE_ERROR\n\t * @static\n\t * @final\n\t */\n\tFILE_DUPLICATE_ERROR : -602,\n\n\t/**\n\t * Runtime will try to detect if image is proper one. Otherwise will throw this error.\n\t *\n\t * @property IMAGE_FORMAT_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_FORMAT_ERROR : -700,\n\n\t/**\n\t * While working on the image runtime will try to detect if the operation may potentially run out of memeory and will throw this error.\n\t *\n\t * @property IMAGE_MEMORY_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_MEMORY_ERROR : -701,\n\n\t/**\n\t * Each runtime has an upper limit on a dimension of the image it can handle. If bigger, will throw this error.\n\t *\n\t * @property IMAGE_DIMENSIONS_ERROR\n\t * @static\n\t * @final\n\t */\n\tIMAGE_DIMENSIONS_ERROR : -702,\n\n\t/**\n\t * Mime type lookup table.\n\t *\n\t * @property mimeTypes\n\t * @type Object\n\t * @final\n\t */\n\tmimeTypes : o.mimes,\n\n\t/**\n\t * In some cases sniffing is the only way around :(\n\t */\n\tua: o.ua,\n\n\t/**\n\t * Gets the true type of the built-in object (better version of typeof).\n\t * @credits Angus Croll (http://javascriptweblog.wordpress.com/)\n\t *\n\t * @method typeOf\n\t * @static\n\t * @param {Object} o Object to check.\n\t * @return {String} Object [[Class]]\n\t */\n\ttypeOf: o.typeOf,\n\n\t/**\n\t * Extends the specified object with another object.\n\t *\n\t * @method extend\n\t * @static\n\t * @param {Object} target Object to extend.\n\t * @param {Object..} obj Multiple objects to extend with.\n\t * @return {Object} Same as target, the extended object.\n\t */\n\textend : o.extend,\n\n\t/**\n\t * Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.\n\t * The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages\n\t * to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.\n\t * It's more probable for the earth to be hit with an ansteriod. You can also if you want to be 100% sure set the plupload.guidPrefix property\n\t * to an user unique key.\n\t *\n\t * @method guid\n\t * @static\n\t * @return {String} Virtually unique id.\n\t */\n\tguid : o.guid,\n\n\t/**\n\t * Get array of DOM Elements by their ids.\n\t * \n\t * @method get\n\t * @for Utils\n\t * @param {String} id Identifier of the DOM Element\n\t * @return {Array}\n\t*/\n\tget : function get(ids) {\n\t\tvar els = [], el;\n\n\t\tif (o.typeOf(ids) !== 'array') {\n\t\t\tids = [ids];\n\t\t}\n\n\t\tvar i = ids.length;\n\t\twhile (i--) {\n\t\t\tel = o.get(ids[i]);\n\t\t\tif (el) {\n\t\t\t\tels.push(el);\n\t\t\t}\n\t\t}\n\n\t\treturn els.length ? els : null;\n\t},\n\n\t/**\n\t * Executes the callback function for each item in array/object. If you return false in the\n\t * callback it will break the loop.\n\t *\n\t * @method each\n\t * @static\n\t * @param {Object} obj Object to iterate.\n\t * @param {function} callback Callback function to execute for each item.\n\t */\n\teach : o.each,\n\n\t/**\n\t * Returns the absolute x, y position of an Element. The position will be returned in a object with x, y fields.\n\t *\n\t * @method getPos\n\t * @static\n\t * @param {Element} node HTML element or element id to get x, y position from.\n\t * @param {Element} root Optional root element to stop calculations at.\n\t * @return {object} Absolute position of the specified element object with x, y fields.\n\t */\n\tgetPos : o.getPos,\n\n\t/**\n\t * Returns the size of the specified node in pixels.\n\t *\n\t * @method getSize\n\t * @static\n\t * @param {Node} node Node to get the size of.\n\t * @return {Object} Object with a w and h property.\n\t */\n\tgetSize : o.getSize,\n\n\t/**\n\t * Encodes the specified string.\n\t *\n\t * @method xmlEncode\n\t * @static\n\t * @param {String} s String to encode.\n\t * @return {String} Encoded string.\n\t */\n\txmlEncode : function(str) {\n\t\tvar xmlEncodeChars = {'<' : 'lt', '>' : 'gt', '&' : 'amp', '\"' : 'quot', '\\'' : '#39'}, xmlEncodeRegExp = /[<>&\\\"\\']/g;\n\n\t\treturn str ? ('' + str).replace(xmlEncodeRegExp, function(chr) {\n\t\t\treturn xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;\n\t\t}) : str;\n\t},\n\n\t/**\n\t * Forces anything into an array.\n\t *\n\t * @method toArray\n\t * @static\n\t * @param {Object} obj Object with length field.\n\t * @return {Array} Array object containing all items.\n\t */\n\ttoArray : o.toArray,\n\n\t/**\n\t * Find an element in array and return it's index if present, otherwise return -1.\n\t *\n\t * @method inArray\n\t * @static\n\t * @param {mixed} needle Element to find\n\t * @param {Array} array\n\t * @return {Int} Index of the element, or -1 if not found\n\t */\n\tinArray : o.inArray,\n\n\t/**\n\t * Extends the language pack object with new items.\n\t *\n\t * @method addI18n\n\t * @static\n\t * @param {Object} pack Language pack items to add.\n\t * @return {Object} Extended language pack object.\n\t */\n\taddI18n : o.addI18n,\n\n\t/**\n\t * Translates the specified string by checking for the english string in the language pack lookup.\n\t *\n\t * @method translate\n\t * @static\n\t * @param {String} str String to look for.\n\t * @return {String} Translated string or the input string if it wasn't found.\n\t */\n\ttranslate : o.translate,\n\n\t/**\n\t * Checks if object is empty.\n\t *\n\t * @method isEmptyObj\n\t * @static\n\t * @param {Object} obj Object to check.\n\t * @return {Boolean}\n\t */\n\tisEmptyObj : o.isEmptyObj,\n\n\t/**\n\t * Checks if specified DOM element has specified class.\n\t *\n\t * @method hasClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\thasClass : o.hasClass,\n\n\t/**\n\t * Adds specified className to specified DOM element.\n\t *\n\t * @method addClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\taddClass : o.addClass,\n\n\t/**\n\t * Removes specified className from specified DOM element.\n\t *\n\t * @method removeClass\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Class name\n\t */\n\tremoveClass : o.removeClass,\n\n\t/**\n\t * Returns a given computed style of a DOM element.\n\t *\n\t * @method getStyle\n\t * @static\n\t * @param {Object} obj DOM element like object.\n\t * @param {String} name Style you want to get from the DOM element\n\t */\n\tgetStyle : o.getStyle,\n\n\t/**\n\t * Adds an event handler to the specified object and store reference to the handler\n\t * in objects internal Plupload registry (@see removeEvent).\n\t *\n\t * @method addEvent\n\t * @static\n\t * @param {Object} obj DOM element like object to add handler to.\n\t * @param {String} name Name to add event listener to.\n\t * @param {Function} callback Function to call when event occurs.\n\t * @param {String} (optional) key that might be used to add specifity to the event record.\n\t */\n\taddEvent : o.addEvent,\n\n\t/**\n\t * Remove event handler from the specified object. If third argument (callback)\n\t * is not specified remove all events with the specified name.\n\t *\n\t * @method removeEvent\n\t * @static\n\t * @param {Object} obj DOM element to remove event listener(s) from.\n\t * @param {String} name Name of event listener to remove.\n\t * @param {Function|String} (optional) might be a callback or unique key to match.\n\t */\n\tremoveEvent: o.removeEvent,\n\n\t/**\n\t * Remove all kind of events from the specified object\n\t *\n\t * @method removeAllEvents\n\t * @static\n\t * @param {Object} obj DOM element to remove event listeners from.\n\t * @param {String} (optional) unique key to match, when removing events.\n\t */\n\tremoveAllEvents: o.removeAllEvents,\n\n\t/**\n\t * Cleans the specified name from national characters (diacritics). The result will be a name with only a-z, 0-9 and _.\n\t *\n\t * @method cleanName\n\t * @static\n\t * @param {String} s String to clean up.\n\t * @return {String} Cleaned string.\n\t */\n\tcleanName : function(name) {\n\t\tvar i, lookup;\n\n\t\t// Replace diacritics\n\t\tlookup = [\n\t\t\t/[\\300-\\306]/g, 'A', /[\\340-\\346]/g, 'a',\n\t\t\t/\\307/g, 'C', /\\347/g, 'c',\n\t\t\t/[\\310-\\313]/g, 'E', /[\\350-\\353]/g, 'e',\n\t\t\t/[\\314-\\317]/g, 'I', /[\\354-\\357]/g, 'i',\n\t\t\t/\\321/g, 'N', /\\361/g, 'n',\n\t\t\t/[\\322-\\330]/g, 'O', /[\\362-\\370]/g, 'o',\n\t\t\t/[\\331-\\334]/g, 'U', /[\\371-\\374]/g, 'u'\n\t\t];\n\n\t\tfor (i = 0; i < lookup.length; i += 2) {\n\t\t\tname = name.replace(lookup[i], lookup[i + 1]);\n\t\t}\n\n\t\t// Replace whitespace\n\t\tname = name.replace(/\\s+/g, '_');\n\n\t\t// Remove anything else\n\t\tname = name.replace(/[^a-z0-9_\\-\\.]+/gi, '');\n\n\t\treturn name;\n\t},\n\n\t/**\n\t * Builds a full url out of a base URL and an object with items to append as query string items.\n\t *\n\t * @method buildUrl\n\t * @static\n\t * @param {String} url Base URL to append query string items to.\n\t * @param {Object} items Name/value object to serialize as a querystring.\n\t * @return {String} String with url + serialized query string items.\n\t */\n\tbuildUrl : function(url, items) {\n\t\tvar query = '';\n\n\t\tplupload.each(items, function(value, name) {\n\t\t\tquery += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);\n\t\t});\n\n\t\tif (query) {\n\t\t\turl += (url.indexOf('?') > 0 ? '&' : '?') + query;\n\t\t}\n\n\t\treturn url;\n\t},\n\n\t/**\n\t * Formats the specified number as a size string for example 1024 becomes 1 KB.\n\t *\n\t * @method formatSize\n\t * @static\n\t * @param {Number} size Size to format as string.\n\t * @return {String} Formatted size string.\n\t */\n\tformatSize : function(size) {\n\t\tif (size === undef || /\\D/.test(size)) {\n\t\t\treturn plupload.translate('N/A');\n\t\t}\n\n\t\t// TB\n\t\tif (size > 1099511627776) {\n\t\t\treturn Math.round(size / 1099511627776, 1) + \" \" + plupload.translate('tb');\n\t\t}\n\n\t\t// GB\n\t\tif (size > 1073741824) {\n\t\t\treturn Math.round(size / 1073741824, 1) + \" \" + plupload.translate('gb');\n\t\t}\n\n\t\t// MB\n\t\tif (size > 1048576) {\n\t\t\treturn Math.round(size / 1048576, 1) + \" \" + plupload.translate('mb');\n\t\t}\n\n\t\t// KB\n\t\tif (size > 1024) {\n\t\t\treturn Math.round(size / 1024, 1) + \" \" + plupload.translate('kb');\n\t\t}\n\n\t\treturn size + \" \" + plupload.translate('b');\n\t},\n\n\n\t/**\n\t * Parses the specified size string into a byte value. For example 10kb becomes 10240.\n\t *\n\t * @method parseSize\n\t * @static\n\t * @param {String|Number} size String to parse or number to just pass through.\n\t * @return {Number} Size in bytes.\n\t */\n\tparseSize : o.parseSizeStr,\n\n\n\t/**\n\t * A way to predict what runtime will be choosen in the current environment with the\n\t * specified settings.\n\t *\n\t * @method predictRuntime\n\t * @static\n\t * @param {Object|String} config Plupload settings to check\n\t * @param {String} [runtimes] Comma-separated list of runtimes to check against\n\t * @return {String} Type of compatible runtime\n\t */\n\tpredictRuntime : function(config, runtimes) {\n\t\tvar up, runtime;\n\n\t\tup = new plupload.Uploader(config);\n\t\truntime = o.Runtime.thatCan(up.getOption().required_features, runtimes || config.runtimes);\n\t\tup.destroy();\n\t\treturn runtime;\n\t},\n\n\t/**\n\t * Registers a filter that will be executed for each file added to the queue.\n\t * If callback returns false, file will not be added.\n\t *\n\t * Callback receives two arguments: a value for the filter as it was specified in settings.filters\n\t * and a file to be filtered. Callback is executed in the context of uploader instance.\n\t *\n\t * @method addFileFilter\n\t * @static\n\t * @param {String} name Name of the filter by which it can be referenced in settings.filters\n\t * @param {String} cb Callback - the actual routine that every added file must pass\n\t */\n\taddFileFilter: function(name, cb) {\n\t\tfileFilters[name] = cb;\n\t}\n};\n\n\nplupload.addFileFilter('mime_types', function(filters, file, cb) {\n\tif (filters.length && !filters.regexp.test(file.name)) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_EXTENSION_ERROR,\n\t\t\tmessage : plupload.translate('File extension error.'),\n\t\t\tfile : file\n\t\t});\n\t\tcb(false);\n\t} else {\n\t\tcb(true);\n\t}\n});\n\n\nplupload.addFileFilter('max_file_size', function(maxSize, file, cb) {\n\tvar undef;\n\n\t// Invalid file size\n\tif (file.size !== undef && maxSize && file.size > maxSize) {\n\t\tthis.trigger('Error', {\n\t\t\tcode : plupload.FILE_SIZE_ERROR,\n\t\t\tmessage : plupload.translate('File size error.'),\n\t\t\tfile : file\n\t\t});\n\t\tcb(false);\n\t} else {\n\t\tcb(true);\n\t}\n});\n\n\nplupload.addFileFilter('prevent_duplicates', function(value, file, cb) {\n\tif (value) {\n\t\tvar ii = this.files.length;\n\t\twhile (ii--) {\n\t\t\t// Compare by name and size (size might be 0 or undefined, but still equivalent for both)\n\t\t\tif (file.name === this.files[ii].name && file.size === this.files[ii].size) {\n\t\t\t\tthis.trigger('Error', {\n\t\t\t\t\tcode : plupload.FILE_DUPLICATE_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Duplicate file error.'),\n\t\t\t\t\tfile : file\n\t\t\t\t});\n\t\t\t\tcb(false);\n\t\t\t\treturn;\n\t\t\t}\n\t\t}\n\t}\n\tcb(true);\n});\n\n\n/**\n@class Uploader\n@constructor\n\n@param {Object} settings For detailed information about each option check documentation.\n\t@param {String|DOMElement} settings.browse_button id of the DOM element or DOM element itself to use as file dialog trigger.\n\t@param {String} settings.url URL of the server-side upload handler.\n\t@param {Number|String} [settings.chunk_size=0] Chunk size in bytes to slice the file into. Shorcuts with b, kb, mb, gb, tb suffixes also supported. `e.g. 204800 or \"204800b\" or \"200kb\"`. By default - disabled.\n\t@param {String} [settings.container] id of the DOM element to use as a container for uploader structures. Defaults to document.body.\n\t@param {String|DOMElement} [settings.drop_element] id of the DOM element or DOM element itself to use as a drop zone for Drag-n-Drop.\n\t@param {String} [settings.file_data_name=\"file\"] Name for the file field in Multipart formated message.\n\t@param {Object} [settings.filters={}] Set of file type filters.\n\t\t@param {Array} [settings.filters.mime_types=[]] List of file types to accept, each one defined by title and list of extensions. `e.g. {title : \"Image files\", extensions : \"jpg,jpeg,gif,png\"}`. Dispatches `plupload.FILE_EXTENSION_ERROR`\n\t\t@param {String|Number} [settings.filters.max_file_size=0] Maximum file size that the user can pick, in bytes. Optionally supports b, kb, mb, gb, tb suffixes. `e.g. \"10mb\" or \"1gb\"`. By default - not set. Dispatches `plupload.FILE_SIZE_ERROR`.\n\t\t@param {Boolean} [settings.filters.prevent_duplicates=false] Do not let duplicates into the queue. Dispatches `plupload.FILE_DUPLICATE_ERROR`.\n\t@param {String} [settings.flash_swf_url] URL of the Flash swf.\n\t@param {Object} [settings.headers] Custom headers to send with the upload. Hash of name/value pairs.\n\t@param {Number} [settings.max_retries=0] How many times to retry the chunk or file, before triggering Error event.\n\t@param {Boolean} [settings.multipart=true] Whether to send file and additional parameters as Multipart formated message.\n\t@param {Object} [settings.multipart_params] Hash of key/value pairs to send with every file upload.\n\t@param {Boolean} [settings.multi_selection=true] Enable ability to select multiple files at once in file dialog.\n\t@param {String|Object} [settings.required_features] Either comma-separated list or hash of required features that chosen runtime should absolutely possess.\n\t@param {Object} [settings.resize] Enable resizng of images on client-side. Applies to `image/jpeg` and `image/png` only. `e.g. {width : 200, height : 200, quality : 90, crop: true}`\n\t\t@param {Number} [settings.resize.width] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.height] If image is bigger, it will be resized.\n\t\t@param {Number} [settings.resize.quality=90] Compression quality for jpegs (1-100).\n\t\t@param {Boolean} [settings.resize.crop=false] Whether to crop images to exact dimensions. By default they will be resized proportionally.\n\t@param {String} [settings.runtimes=\"html5,flash,silverlight,html4\"] Comma separated list of runtimes, that Plupload will try in turn, moving to the next if previous fails.\n\t@param {String} [settings.silverlight_xap_url] URL of the Silverlight xap.\n\t@param {Boolean} [settings.unique_names=false] If true will generate unique filenames for uploaded files.\n*/\nplupload.Uploader = function(options) {\n\t/**\n\t * Fires when the current RunTime has been initialized.\n\t *\n\t * @event Init\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires after the init event incase you need to perform actions there.\n\t *\n\t * @event PostInit\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when the option is changed in via uploader.setOption().\n\t *\n\t * @event OptionChanged\n\t * @since 2.1\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {String} name Name of the option that was changed\n\t * @param {Mixed} value New value for the specified option\n\t * @param {Mixed} oldValue Previous value of the option\n\t */\n\n\t/**\n\t * Fires when the silverlight/flash or other shim needs to move.\n\t *\n\t * @event Refresh\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when the overall state is being changed for the upload queue.\n\t *\n\t * @event StateChanged\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires when a file is to be uploaded by the runtime.\n\t *\n\t * @event UploadFile\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\t * Fires when just before a file is uploaded. This event enables you to override settings\n\t * on the uploader instance before the file is uploaded.\n\t *\n\t * @event BeforeUpload\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File to be uploaded.\n\t */\n\n\t/**\n\t * Fires when the file queue is changed. In other words when files are added/removed to the files array of the uploader instance.\n\t *\n\t * @event QueueChanged\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\n\t/**\n\t * Fires while a file is being uploaded. Use this event to update the current file upload progress.\n\t *\n\t * @event UploadProgress\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that is currently being uploaded.\n\t */\n\n\t/**\n\t * Fires when file is removed from the queue.\n\t *\n\t * @event FilesRemoved\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of files that got removed.\n\t */\n\n\t/**\n\t * Fires for every filtered file before it is added to the queue.\n\t * \n\t * @event FileFiltered\n\t * @since 2.1\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file Another file that has to be added to the queue.\n\t */\n\n\t/**\n\t * Fires after files were filtered and added to the queue.\n\t *\n\t * @event FilesAdded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of file objects that were added to queue by the user.\n\t */\n\n\t/**\n\t * Fires when a file is successfully uploaded.\n\t *\n\t * @event FileUploaded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that was uploaded.\n\t * @param {Object} response Object with response properties.\n\t */\n\n\t/**\n\t * Fires when file chunk is uploaded.\n\t *\n\t * @event ChunkUploaded\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {plupload.File} file File that the chunk was uploaded for.\n\t * @param {Object} response Object with response properties.\n\t */\n\n\t/**\n\t * Fires when all files in a queue are uploaded.\n\t *\n\t * @event UploadComplete\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Array} files Array of file objects that was added to queue/selected by the user.\n\t */\n\n\t/**\n\t * Fires when a error occurs.\n\t *\n\t * @event Error\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t * @param {Object} error Contains code, message and sometimes file and other details.\n\t */\n\n\t/**\n\t * Fires when destroy method is called.\n\t *\n\t * @event Destroy\n\t * @param {plupload.Uploader} uploader Uploader instance sending the event.\n\t */\n\tvar uid = plupload.guid()\n\t, settings\n\t, files = []\n\t, preferred_caps = {}\n\t, fileInputs = []\n\t, fileDrops = []\n\t, startTime\n\t, total\n\t, disabled = false\n\t, xhr\n\t;\n\n\n\t// Private methods\n\tfunction uploadNext() {\n\t\tvar file, count = 0, i;\n\n\t\tif (this.state == plupload.STARTED) {\n\t\t\t// Find first QUEUED file\n\t\t\tfor (i = 0; i < files.length; i++) {\n\t\t\t\tif (!file && files[i].status == plupload.QUEUED) {\n\t\t\t\t\tfile = files[i];\n\t\t\t\t\tif (this.trigger(\"BeforeUpload\", file)) {\n\t\t\t\t\t\tfile.status = plupload.UPLOADING;\n\t\t\t\t\t\tthis.trigger(\"UploadFile\", file);\n\t\t\t\t\t}\n\t\t\t\t} else {\n\t\t\t\t\tcount++;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\t// All files are DONE or FAILED\n\t\t\tif (count == files.length) {\n\t\t\t\tif (this.state !== plupload.STOPPED) {\n\t\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\t\tthis.trigger(\"StateChanged\");\n\t\t\t\t}\n\t\t\t\tthis.trigger(\"UploadComplete\", files);\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction calcFile(file) {\n\t\tfile.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;\n\t\tcalc();\n\t}\n\n\n\tfunction calc() {\n\t\tvar i, file;\n\n\t\t// Reset stats\n\t\ttotal.reset();\n\n\t\t// Check status, size, loaded etc on all files\n\t\tfor (i = 0; i < files.length; i++) {\n\t\t\tfile = files[i];\n\n\t\t\tif (file.size !== undef) {\n\t\t\t\t// We calculate totals based on original file size\n\t\t\t\ttotal.size += file.origSize;\n\n\t\t\t\t// Since we cannot predict file size after resize, we do opposite and\n\t\t\t\t// interpolate loaded amount to match magnitude of total\n\t\t\t\ttotal.loaded += file.loaded * file.origSize / file.size;\n\t\t\t} else {\n\t\t\t\ttotal.size = undef;\n\t\t\t}\n\n\t\t\tif (file.status == plupload.DONE) {\n\t\t\t\ttotal.uploaded++;\n\t\t\t} else if (file.status == plupload.FAILED) {\n\t\t\t\ttotal.failed++;\n\t\t\t} else {\n\t\t\t\ttotal.queued++;\n\t\t\t}\n\t\t}\n\n\t\t// If we couldn't calculate a total file size then use the number of files to calc percent\n\t\tif (total.size === undef) {\n\t\t\ttotal.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;\n\t\t} else {\n\t\t\ttotal.bytesPerSec = Math.ceil(total.loaded / ((+new Date() - startTime || 1) / 1000.0));\n\t\t\ttotal.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;\n\t\t}\n\t}\n\n\n\tfunction getRUID() {\n\t\tvar ctrl = fileInputs[0] || fileDrops[0];\n\t\tif (ctrl) {\n\t\t\treturn ctrl.getRuntime().uid;\n\t\t}\n\t\treturn false;\n\t}\n\n\n\tfunction runtimeCan(file, cap) {\n\t\tif (file.ruid) {\n\t\t\tvar info = o.Runtime.getInfo(file.ruid);\n\t\t\tif (info) {\n\t\t\t\treturn info.can(cap);\n\t\t\t}\n\t\t}\n\t\treturn false;\n\t}\n\n\n\tfunction bindEventListeners() {\n\t\tthis.bind('FilesAdded', onFilesAdded);\n\n\t\tthis.bind('CancelUpload', onCancelUpload);\n\t\t\n\t\tthis.bind('BeforeUpload', onBeforeUpload);\n\n\t\tthis.bind('UploadFile', onUploadFile);\n\n\t\tthis.bind('UploadProgress', onUploadProgress);\n\n\t\tthis.bind('StateChanged', onStateChanged);\n\n\t\tthis.bind('QueueChanged', calc);\n\n\t\tthis.bind('Error', onError);\n\n\t\tthis.bind('FileUploaded', onFileUploaded);\n\n\t\tthis.bind('Destroy', onDestroy);\n\t}\n\n\n\tfunction initControls(settings, cb) {\n\t\tvar self = this, inited = 0, queue = [];\n\n\t\t// common settings\n\t\tvar options = {\n\t\t\taccept: settings.filters.mime_types,\n\t\t\truntime_order: settings.runtimes,\n\t\t\trequired_caps: settings.required_features,\n\t\t\tpreferred_caps: preferred_caps,\n\t\t\tswf_url: settings.flash_swf_url,\n\t\t\txap_url: settings.silverlight_xap_url\n\t\t};\n\n\t\t// add runtime specific options if any\n\t\tplupload.each(settings.runtimes.split(/\\s*,\\s*/), function(runtime) {\n\t\t\tif (settings[runtime]) {\n\t\t\t\toptions[runtime] = settings[runtime];\n\t\t\t}\n\t\t});\n\n\t\t// initialize file pickers - there can be many\n\t\tif (settings.browse_button) {\n\t\t\tplupload.each(settings.browse_button, function(el) {\n\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\tvar fileInput = new o.FileInput(plupload.extend({}, options, {\n\t\t\t\t\t\tname: settings.file_data_name,\n\t\t\t\t\t\tmultiple: settings.multi_selection,\n\t\t\t\t\t\tcontainer: settings.container,\n\t\t\t\t\t\tbrowse_button: el\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileInput.onready = function() {\n\t\t\t\t\t\tvar info = o.Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\t// for backward compatibility\n\t\t\t\t\t\to.extend(self.features, {\n\t\t\t\t\t\t\tchunks: info.can('slice_blob'),\n\t\t\t\t\t\t\tmultipart: info.can('send_multipart'),\n\t\t\t\t\t\t\tmulti_selection: info.can('select_multiple')\n\t\t\t\t\t\t});\n\n\t\t\t\t\t\tinited++;\n\t\t\t\t\t\tfileInputs.push(this);\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.onchange = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileInput.bind('mouseenter mouseleave mousedown mouseup', function(e) {\n\t\t\t\t\t\tif (!disabled) {\n\t\t\t\t\t\t\tif (settings.browse_button_hover) {\n\t\t\t\t\t\t\t\tif ('mouseenter' === e.type) {\n\t\t\t\t\t\t\t\t\to.addClass(el, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t} else if ('mouseleave' === e.type) {\n\t\t\t\t\t\t\t\t\to.removeClass(el, settings.browse_button_hover);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tif (settings.browse_button_active) {\n\t\t\t\t\t\t\t\tif ('mousedown' === e.type) {\n\t\t\t\t\t\t\t\t\to.addClass(el, settings.browse_button_active);\n\t\t\t\t\t\t\t\t} else if ('mouseup' === e.type) {\n\t\t\t\t\t\t\t\t\to.removeClass(el, settings.browse_button_active);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileInput = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileInput.init();\n\t\t\t\t});\n\t\t\t});\n\t\t}\n\n\t\t// initialize drop zones\n\t\tif (settings.drop_element) {\n\t\t\tplupload.each(settings.drop_element, function(el) {\n\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\tvar fileDrop = new o.FileDrop(plupload.extend({}, options, {\n\t\t\t\t\t\tdrop_zone: el\n\t\t\t\t\t}));\n\n\t\t\t\t\tfileDrop.onready = function() {\n\t\t\t\t\t\tvar info = o.Runtime.getInfo(this.ruid);\n\n\t\t\t\t\t\tself.features.dragdrop = info.can('drag_and_drop'); // for backward compatibility\n\n\t\t\t\t\t\tinited++;\n\t\t\t\t\t\tfileDrops.push(this);\n\t\t\t\t\t\tcb();\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.ondrop = function() {\n\t\t\t\t\t\tself.addFile(this.files);\n\t\t\t\t\t};\n\n\t\t\t\t\tfileDrop.bind('error runtimeerror', function() {\n\t\t\t\t\t\tfileDrop = null;\n\t\t\t\t\t\tcb();\n\t\t\t\t\t});\n\n\t\t\t\t\tfileDrop.init();\n\t\t\t\t});\n\t\t\t});\n\t\t}\n\n\n\t\to.inSeries(queue, function() {\n\t\t\tif (typeof(cb) === 'function') {\n\t\t\t\tcb(inited);\n\t\t\t}\n\t\t});\n\t}\n\n\n\tfunction resizeImage(blob, params, cb) {\n\t\tvar img = new o.Image();\n\n\t\ttry {\n\t\t\timg.onload = function() {\n\t\t\t\timg.downsize(params.width, params.height, params.crop, params.preserve_headers);\n\t\t\t};\n\n\t\t\timg.onresize = function() {\n\t\t\t\tcb(this.getAsBlob(blob.type, params.quality));\n\t\t\t\tthis.destroy();\n\t\t\t};\n\n\t\t\timg.onerror = function() {\n\t\t\t\tcb(blob);\n\t\t\t};\n\n\t\t\timg.load(blob);\n\t\t} catch(ex) {\n\t\t\tcb(blob);\n\t\t}\n\t}\n\n\n\tfunction setOption(option, value, init) {\n\t\tvar self = this, reinitRequired = false;\n\n\t\tfunction _setOption(option, value, init) {\n\t\t\tvar oldValue = settings[option];\n\n\t\t\tswitch (option) {\n\t\t\t\tcase 'max_file_size':\n\t\t\t\tcase 'chunk_size':\n\t\t\t\t\tif (value = plupload.parseSize(value)) {\n\t\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\t\tif (option === 'max_file_size') {\n\t\t\t\t\t\t\tsettings.max_file_size = settings.filters.max_file_size = value;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'filters':\n\t\t\t\t\t// for sake of backward compatibility\n\t\t\t\t\tif (plupload.typeOf(value) === 'array') {\n\t\t\t\t\t\tvalue = {\n\t\t\t\t\t\t\tmime_types: value\n\t\t\t\t\t\t};\n\t\t\t\t\t}\n\n\t\t\t\t\tif (init) {\n\t\t\t\t\t\tplupload.extend(settings.filters, value);\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsettings.filters = value;\n\t\t\t\t\t}\n\n\t\t\t\t\t// if file format filters are being updated, regenerate the matching expressions\n\t\t\t\t\tif (value.mime_types) {\n\t\t\t\t\t\tsettings.filters.mime_types.regexp = (function(filters) {\n\t\t\t\t\t\t\tvar extensionsRegExp = [];\n\n\t\t\t\t\t\t\tplupload.each(filters, function(filter) {\n\t\t\t\t\t\t\t\tplupload.each(filter.extensions.split(/,/), function(ext) {\n\t\t\t\t\t\t\t\t\tif (/^\\s*\\*\\s*$/.test(ext)) {\n\t\t\t\t\t\t\t\t\t\textensionsRegExp.push('\\\\.*');\n\t\t\t\t\t\t\t\t\t} else {\n\t\t\t\t\t\t\t\t\t\textensionsRegExp.push('\\\\.' + ext.replace(new RegExp('[' + ('/^$.*+?|()[]{}\\\\'.replace(/./g, '\\\\$&')) + ']', 'g'), '\\\\$&'));\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t});\n\t\t\t\t\t\t\t});\n\n\t\t\t\t\t\t\treturn new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');\n\t\t\t\t\t\t}(settings.filters.mime_types));\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\t\n\t\t\t\tcase 'resize':\n\t\t\t\t\tif (init) {\n\t\t\t\t\t\tplupload.extend(settings.resize, value, {\n\t\t\t\t\t\t\tenabled: true\n\t\t\t\t\t\t});\n\t\t\t\t\t} else {\n\t\t\t\t\t\tsettings.resize = value;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'prevent_duplicates':\n\t\t\t\t\tsettings.prevent_duplicates = settings.filters.prevent_duplicates = !!value;\n\t\t\t\t\tbreak;\n\n\t\t\t\tcase 'browse_button':\n\t\t\t\tcase 'drop_element':\n\t\t\t\t\t\tvalue = plupload.get(value);\n\n\t\t\t\tcase 'container':\n\t\t\t\tcase 'runtimes':\n\t\t\t\tcase 'multi_selection':\n\t\t\t\tcase 'flash_swf_url':\n\t\t\t\tcase 'silverlight_xap_url':\n\t\t\t\t\tsettings[option] = value;\n\t\t\t\t\tif (!init) {\n\t\t\t\t\t\treinitRequired = true;\n\t\t\t\t\t}\n\t\t\t\t\tbreak;\n\n\t\t\t\tdefault:\n\t\t\t\t\tsettings[option] = value;\n\t\t\t}\n\n\t\t\tif (!init) {\n\t\t\t\tself.trigger('OptionChanged', option, value, oldValue);\n\t\t\t}\n\t\t}\n\n\t\tif (typeof(option) === 'object') {\n\t\t\tplupload.each(option, function(value, option) {\n\t\t\t\t_setOption(option, value, init);\n\t\t\t});\n\t\t} else {\n\t\t\t_setOption(option, value, init);\n\t\t}\n\n\t\tif (init) {\n\t\t\t// Normalize the list of required capabilities\n\t\t\tsettings.required_features = normalizeCaps(plupload.extend({}, settings));\n\n\t\t\t// Come up with the list of capabilities that can affect default mode in a multi-mode runtimes\n\t\t\tpreferred_caps = normalizeCaps(plupload.extend({}, settings, {\n\t\t\t\trequired_features: true\n\t\t\t}));\n\t\t} else if (reinitRequired) {\n\t\t\tself.trigger('Destroy');\n\t\t\t\n\t\t\tinitControls.call(self, settings, function(inited) {\n\t\t\t\tif (inited) {\n\t\t\t\t\tself.runtime = o.Runtime.getInfo(getRUID()).type;\n\t\t\t\t\tself.trigger('Init', { runtime: self.runtime });\n\t\t\t\t\tself.trigger('PostInit');\n\t\t\t\t} else {\n\t\t\t\t\tself.trigger('Error', {\n\t\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t}\n\t}\n\n\n\t// Internal event handlers\n\tfunction onFilesAdded(up, filteredFiles) {\n\t\t// Add files to queue\t\t\t\t\n\t\t[].push.apply(files, filteredFiles);\n\n\t\tup.trigger('QueueChanged');\n\t\tup.refresh();\n\t}\n\n\n\tfunction onBeforeUpload(up, file) {\n\t\t// Generate unique target filenames\n\t\tif (settings.unique_names) {\n\t\t\tvar matches = file.name.match(/\\.([^.]+)$/), ext = \"part\";\n\t\t\tif (matches) {\n\t\t\t\text = matches[1];\n\t\t\t}\n\t\t\tfile.target_name = file.id + '.' + ext;\n\t\t}\n\t}\n\n\n\tfunction onUploadFile(up, file) {\n\t\tvar url = up.settings.url\n\t\t, chunkSize = up.settings.chunk_size\n\t\t, retries = up.settings.max_retries\n\t\t, features = up.features\n\t\t, offset = 0\n\t\t, blob\n\t\t;\n\n\t\t// make sure we start at a predictable offset\n\t\tif (file.loaded) {\n\t\t\toffset = file.loaded = chunkSize * Math.floor(file.loaded / chunkSize);\n\t\t}\n\n\t\tfunction handleError() {\n\t\t\tif (retries-- > 0) {\n\t\t\t\tdelay(uploadNextChunk, 1000);\n\t\t\t} else {\n\t\t\t\tfile.loaded = offset; // reset all progress\n\n\t\t\t\tup.trigger('Error', {\n\t\t\t\t\tcode : plupload.HTTP_ERROR,\n\t\t\t\t\tmessage : plupload.translate('HTTP Error.'),\n\t\t\t\t\tfile : file,\n\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\n\t\tfunction uploadNextChunk() {\n\t\t\tvar chunkBlob, formData, args, curChunkSize;\n\n\t\t\t// File upload finished\n\t\t\tif (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\t// Standard arguments\n\t\t\targs = {name : file.target_name || file.name};\n\n\t\t\tif (chunkSize && features.chunks && blob.size > chunkSize) { // blob will be of type string if it was loaded in memory \n\t\t\t\tcurChunkSize = Math.min(chunkSize, blob.size - offset);\n\t\t\t\tchunkBlob = blob.slice(offset, offset + curChunkSize);\n\t\t\t} else {\n\t\t\t\tcurChunkSize = blob.size;\n\t\t\t\tchunkBlob = blob;\n\t\t\t}\n\n\t\t\t// If chunking is enabled add corresponding args, no matter if file is bigger than chunk or smaller\n\t\t\tif (chunkSize && features.chunks) {\n\t\t\t\t// Setup query string arguments\n\t\t\t\tif (up.settings.send_chunk_number) {\n\t\t\t\t\targs.chunk = Math.ceil(offset / chunkSize);\n\t\t\t\t\targs.chunks = Math.ceil(blob.size / chunkSize);\n\t\t\t\t} else { // keep support for experimental chunk format, just in case\n\t\t\t\t\targs.offset = offset;\n\t\t\t\t\targs.total = blob.size;\n\t\t\t\t}\n\t\t\t}\n\n\t\t\txhr = new o.XMLHttpRequest();\n\n\t\t\t// Do we have upload progress support\n\t\t\tif (xhr.upload) {\n\t\t\t\txhr.upload.onprogress = function(e) {\n\t\t\t\t\tfile.loaded = Math.min(file.size, offset + e.loaded);\n\t\t\t\t\tup.trigger('UploadProgress', file);\n\t\t\t\t};\n\t\t\t}\n\n\t\t\txhr.onload = function() {\n\t\t\t\t// check if upload made itself through\n\t\t\t\tif (xhr.status >= 400) {\n\t\t\t\t\thandleError();\n\t\t\t\t\treturn;\n\t\t\t\t}\n\n\t\t\t\tretries = up.settings.max_retries; // reset the counter\n\n\t\t\t\t// Handle chunk response\n\t\t\t\tif (curChunkSize < blob.size) {\n\t\t\t\t\tchunkBlob.destroy();\n\n\t\t\t\t\toffset += curChunkSize;\n\t\t\t\t\tfile.loaded = Math.min(offset, blob.size);\n\n\t\t\t\t\tup.trigger('ChunkUploaded', file, {\n\t\t\t\t\t\toffset : file.loaded,\n\t\t\t\t\t\ttotal : blob.size,\n\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t});\n\n\t\t\t\t\t// stock Android browser doesn't fire upload progress events, but in chunking mode we can fake them\n\t\t\t\t\tif (o.Env.browser === 'Android Browser') {\n\t\t\t\t\t\t// doesn't harm in general, but is not required anywhere else\n\t\t\t\t\t\tup.trigger('UploadProgress', file);\n\t\t\t\t\t} \n\t\t\t\t} else {\n\t\t\t\t\tfile.loaded = file.size;\n\t\t\t\t}\n\n\t\t\t\tchunkBlob = formData = null; // Free memory\n\n\t\t\t\t// Check if file is uploaded\n\t\t\t\tif (!offset || offset >= blob.size) {\n\t\t\t\t\t// If file was modified, destory the copy\n\t\t\t\t\tif (file.size != file.origSize) {\n\t\t\t\t\t\tblob.destroy();\n\t\t\t\t\t\tblob = null;\n\t\t\t\t\t}\n\n\t\t\t\t\tup.trigger('UploadProgress', file);\n\n\t\t\t\t\tfile.status = plupload.DONE;\n\n\t\t\t\t\tup.trigger('FileUploaded', file, {\n\t\t\t\t\t\tresponse : xhr.responseText,\n\t\t\t\t\t\tstatus : xhr.status,\n\t\t\t\t\t\tresponseHeaders: xhr.getAllResponseHeaders()\n\t\t\t\t\t});\n\t\t\t\t} else {\n\t\t\t\t\t// Still chunks left\n\t\t\t\t\tdelay(uploadNextChunk, 1); // run detached, otherwise event handlers interfere\n\t\t\t\t}\n\t\t\t};\n\n\t\t\txhr.onerror = function() {\n\t\t\t\thandleError();\n\t\t\t};\n\n\t\t\txhr.onloadend = function() {\n\t\t\t\tthis.destroy();\n\t\t\t\txhr = null;\n\t\t\t};\n\n\t\t\t// Build multipart request\n\t\t\tif (up.settings.multipart && features.multipart) {\n\n\t\t\t\targs.name = file.target_name || file.name;\n\n\t\t\t\txhr.open(\"post\", url, true);\n\n\t\t\t\t// Set custom headers\n\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t});\n\n\t\t\t\tformData = new o.FormData();\n\n\t\t\t\t// Add multipart params\n\t\t\t\tplupload.each(plupload.extend(args, up.settings.multipart_params), function(value, name) {\n\t\t\t\t\tformData.append(name, value);\n\t\t\t\t});\n\n\t\t\t\t// Add file and send it\n\t\t\t\tformData.append(up.settings.file_data_name, chunkBlob);\n\t\t\t\txhr.send(formData, {\n\t\t\t\t\truntime_order: up.settings.runtimes,\n\t\t\t\t\trequired_caps: up.settings.required_features,\n\t\t\t\t\tpreferred_caps: preferred_caps,\n\t\t\t\t\tswf_url: up.settings.flash_swf_url,\n\t\t\t\t\txap_url: up.settings.silverlight_xap_url\n\t\t\t\t});\n\t\t\t} else {\n\t\t\t\t// if no multipart, send as binary stream\n\t\t\t\turl = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));\n\n\t\t\t\txhr.open(\"post\", url, true);\n\n\t\t\t\txhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Binary stream header\n\n\t\t\t\t// Set custom headers\n\t\t\t\tplupload.each(up.settings.headers, function(value, name) {\n\t\t\t\t\txhr.setRequestHeader(name, value);\n\t\t\t\t});\n\n\t\t\t\txhr.send(chunkBlob, {\n\t\t\t\t\truntime_order: up.settings.runtimes,\n\t\t\t\t\trequired_caps: up.settings.required_features,\n\t\t\t\t\tpreferred_caps: preferred_caps,\n\t\t\t\t\tswf_url: up.settings.flash_swf_url,\n\t\t\t\t\txap_url: up.settings.silverlight_xap_url\n\t\t\t\t});\n\t\t\t}\n\t\t}\n\n\t\tblob = file.getSource();\n\n\t\t// Start uploading chunks\n\t\tif (up.settings.resize.enabled && runtimeCan(blob, 'send_binary_string') && !!~o.inArray(blob.type, ['image/jpeg', 'image/png'])) {\n\t\t\t// Resize if required\n\t\t\tresizeImage.call(this, blob, up.settings.resize, function(resizedBlob) {\n\t\t\t\tblob = resizedBlob;\n\t\t\t\tfile.size = resizedBlob.size;\n\t\t\t\tuploadNextChunk();\n\t\t\t});\n\t\t} else {\n\t\t\tuploadNextChunk();\n\t\t}\n\t}\n\n\n\tfunction onUploadProgress(up, file) {\n\t\tcalcFile(file);\n\t}\n\n\n\tfunction onStateChanged(up) {\n\t\tif (up.state == plupload.STARTED) {\n\t\t\t// Get start time to calculate bps\n\t\t\tstartTime = (+new Date());\n\t\t} else if (up.state == plupload.STOPPED) {\n\t\t\t// Reset currently uploading files\n\t\t\tfor (var i = up.files.length - 1; i >= 0; i--) {\n\t\t\t\tif (up.files[i].status == plupload.UPLOADING) {\n\t\t\t\t\tup.files[i].status = plupload.QUEUED;\n\t\t\t\t\tcalc();\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction onCancelUpload() {\n\t\tif (xhr) {\n\t\t\txhr.abort();\n\t\t}\n\t}\n\n\n\tfunction onFileUploaded(up) {\n\t\tcalc();\n\n\t\t// Upload next file but detach it from the error event\n\t\t// since other custom listeners might want to stop the queue\n\t\tdelay(function() {\n\t\t\tuploadNext.call(up);\n\t\t}, 1);\n\t}\n\n\n\tfunction onError(up, err) {\n\t\t// Set failed status if an error occured on a file\n\t\tif (err.file) {\n\t\t\terr.file.status = plupload.FAILED;\n\t\t\tcalcFile(err.file);\n\n\t\t\t// Upload next file but detach it from the error event\n\t\t\t// since other custom listeners might want to stop the queue\n\t\t\tif (up.state == plupload.STARTED) { // upload in progress\n\t\t\t\tup.trigger('CancelUpload');\n\t\t\t\tdelay(function() {\n\t\t\t\t\tuploadNext.call(up);\n\t\t\t\t}, 1);\n\t\t\t}\n\t\t}\n\t}\n\n\n\tfunction onDestroy(up) {\n\t\tup.stop();\n\n\t\t// Purge the queue\n\t\tplupload.each(files, function(file) {\n\t\t\tfile.destroy();\n\t\t});\n\t\tfiles = [];\n\n\t\tif (fileInputs.length) {\n\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\tfileInput.destroy();\n\t\t\t});\n\t\t\tfileInputs = [];\n\t\t}\n\n\t\tif (fileDrops.length) {\n\t\t\tplupload.each(fileDrops, function(fileDrop) {\n\t\t\t\tfileDrop.destroy();\n\t\t\t});\n\t\t\tfileDrops = [];\n\t\t}\n\n\t\tpreferred_caps = {};\n\t\tdisabled = false;\n\t\tsettings = startTime = xhr = null;\n\t\ttotal.reset();\n\t}\n\n\n\t// Default settings\n\tsettings = {\n\t\truntimes: o.Runtime.order,\n\t\tmax_retries: 0,\n\t\tchunk_size: 0,\n\t\tmultipart: true,\n\t\tmulti_selection: true,\n\t\tfile_data_name: 'file',\n\t\tflash_swf_url: 'js/Moxie.swf',\n\t\tsilverlight_xap_url: 'js/Moxie.xap',\n\t\tfilters: {\n\t\t\tmime_types: [],\n\t\t\tprevent_duplicates: false,\n\t\t\tmax_file_size: 0\n\t\t},\n\t\tresize: {\n\t\t\tenabled: false,\n\t\t\tpreserve_headers: true,\n\t\t\tcrop: false\n\t\t},\n\t\tsend_chunk_number: true // whether to send chunks and chunk numbers, or total and offset bytes\n\t};\n\n\t\n\tsetOption.call(this, options, null, true);\n\n\t// Inital total state\n\ttotal = new plupload.QueueProgress(); \n\n\t// Add public methods\n\tplupload.extend(this, {\n\n\t\t/**\n\t\t * Unique id for the Uploader instance.\n\t\t *\n\t\t * @property id\n\t\t * @type String\n\t\t */\n\t\tid : uid,\n\t\tuid : uid, // mOxie uses this to differentiate between event targets\n\n\t\t/**\n\t\t * Current state of the total uploading progress. This one can either be plupload.STARTED or plupload.STOPPED.\n\t\t * These states are controlled by the stop/start methods. The default value is STOPPED.\n\t\t *\n\t\t * @property state\n\t\t * @type Number\n\t\t */\n\t\tstate : plupload.STOPPED,\n\n\t\t/**\n\t\t * Map of features that are available for the uploader runtime. Features will be filled\n\t\t * before the init event is called, these features can then be used to alter the UI for the end user.\n\t\t * Some of the current features that might be in this map is: dragdrop, chunks, jpgresize, pngresize.\n\t\t *\n\t\t * @property features\n\t\t * @type Object\n\t\t */\n\t\tfeatures : {},\n\n\t\t/**\n\t\t * Current runtime name.\n\t\t *\n\t\t * @property runtime\n\t\t * @type String\n\t\t */\n\t\truntime : null,\n\n\t\t/**\n\t\t * Current upload queue, an array of File instances.\n\t\t *\n\t\t * @property files\n\t\t * @type Array\n\t\t * @see plupload.File\n\t\t */\n\t\tfiles : files,\n\n\t\t/**\n\t\t * Object with name/value settings.\n\t\t *\n\t\t * @property settings\n\t\t * @type Object\n\t\t */\n\t\tsettings : settings,\n\n\t\t/**\n\t\t * Total progess information. How many files has been uploaded, total percent etc.\n\t\t *\n\t\t * @property total\n\t\t * @type plupload.QueueProgress\n\t\t */\n\t\ttotal : total,\n\n\n\t\t/**\n\t\t * Initializes the Uploader instance and adds internal event listeners.\n\t\t *\n\t\t * @method init\n\t\t */\n\t\tinit : function() {\n\t\t\tvar self = this;\n\n\t\t\tif (typeof(settings.preinit) == \"function\") {\n\t\t\t\tsettings.preinit(self);\n\t\t\t} else {\n\t\t\t\tplupload.each(settings.preinit, function(func, name) {\n\t\t\t\t\tself.bind(name, func);\n\t\t\t\t});\n\t\t\t}\n\n\t\t\t// Check for required options\n\t\t\tif (!settings.browse_button || !settings.url) {\n\t\t\t\tthis.trigger('Error', {\n\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t});\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tbindEventListeners.call(this);\n\n\t\t\tinitControls.call(this, settings, function(inited) {\n\t\t\t\tif (typeof(settings.init) == \"function\") {\n\t\t\t\t\tsettings.init(self);\n\t\t\t\t} else {\n\t\t\t\t\tplupload.each(settings.init, function(func, name) {\n\t\t\t\t\t\tself.bind(name, func);\n\t\t\t\t\t});\n\t\t\t\t}\n\n\t\t\t\tif (inited) {\n\t\t\t\t\tself.runtime = o.Runtime.getInfo(getRUID()).type;\n\t\t\t\t\tself.trigger('Init', { runtime: self.runtime });\n\t\t\t\t\tself.trigger('PostInit');\n\t\t\t\t} else {\n\t\t\t\t\tself.trigger('Error', {\n\t\t\t\t\t\tcode : plupload.INIT_ERROR,\n\t\t\t\t\t\tmessage : plupload.translate('Init error.')\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t});\n\t\t},\n\n\t\t/**\n\t\t * Set the value for the specified option(s).\n\t\t *\n\t\t * @method setOption\n\t\t * @since 2.1\n\t\t * @param {String|Object} option Name of the option to change or the set of key/value pairs\n\t\t * @param {Mixed} [value] Value for the option (is ignored, if first argument is object)\n\t\t */\n\t\tsetOption: function(option, value) {\n\t\t\tsetOption.call(this, option, value, !this.runtime); // until runtime not set we do not need to reinitialize\n\t\t},\n\n\t\t/**\n\t\t * Get the value for the specified option or the whole configuration, if not specified.\n\t\t * \n\t\t * @method getOption\n\t\t * @since 2.1\n\t\t * @param {String} [option] Name of the option to get\n\t\t * @return {Mixed} Value for the option or the whole set\n\t\t */\n\t\tgetOption: function(option) {\n\t\t\tif (!option) {\n\t\t\t\treturn settings;\n\t\t\t}\n\t\t\treturn settings[option];\n\t\t},\n\n\t\t/**\n\t\t * Refreshes the upload instance by dispatching out a refresh event to all runtimes.\n\t\t * This would for example reposition flash/silverlight shims on the page.\n\t\t *\n\t\t * @method refresh\n\t\t */\n\t\trefresh : function() {\n\t\t\tif (fileInputs.length) {\n\t\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\t\tfileInput.trigger('Refresh');\n\t\t\t\t});\n\t\t\t}\n\t\t\tthis.trigger('Refresh');\n\t\t},\n\n\t\t/**\n\t\t * Starts uploading the queued files.\n\t\t *\n\t\t * @method start\n\t\t */\n\t\tstart : function() {\n\t\t\tif (this.state != plupload.STARTED) {\n\t\t\t\tthis.state = plupload.STARTED;\n\t\t\t\tthis.trigger('StateChanged');\n\n\t\t\t\tuploadNext.call(this);\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Stops the upload of the queued files.\n\t\t *\n\t\t * @method stop\n\t\t */\n\t\tstop : function() {\n\t\t\tif (this.state != plupload.STOPPED) {\n\t\t\t\tthis.state = plupload.STOPPED;\n\t\t\t\tthis.trigger('StateChanged');\n\t\t\t\tthis.trigger('CancelUpload');\n\t\t\t}\n\t\t},\n\n\n\t\t/**\n\t\t * Disables/enables browse button on request.\n\t\t *\n\t\t * @method disableBrowse\n\t\t * @param {Boolean} disable Whether to disable or enable (default: true)\n\t\t */\n\t\tdisableBrowse : function() {\n\t\t\tdisabled = arguments[0] !== undef ? arguments[0] : true;\n\n\t\t\tif (fileInputs.length) {\n\t\t\t\tplupload.each(fileInputs, function(fileInput) {\n\t\t\t\t\tfileInput.disable(disabled);\n\t\t\t\t});\n\t\t\t}\n\n\t\t\tthis.trigger('DisableBrowse', disabled);\n\t\t},\n\n\t\t/**\n\t\t * Returns the specified file object by id.\n\t\t *\n\t\t * @method getFile\n\t\t * @param {String} id File id to look for.\n\t\t * @return {plupload.File} File object or undefined if it wasn't found;\n\t\t */\n\t\tgetFile : function(id) {\n\t\t\tvar i;\n\t\t\tfor (i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn files[i];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Adds file to the queue programmatically. Can be native file, instance of Plupload.File,\n\t\t * instance of mOxie.File, input[type=\"file\"] element, or array of these. Fires FilesAdded, \n\t\t * if any files were added to the queue. Otherwise nothing happens.\n\t\t *\n\t\t * @method addFile\n\t\t * @since 2.0\n\t\t * @param {plupload.File|mOxie.File|File|Node|Array} file File or files to add to the queue.\n\t\t * @param {String} [fileName] If specified, will be used as a name for the file\n\t\t */\n\t\taddFile : function(file, fileName) {\n\t\t\tvar self = this\n\t\t\t, queue = [] \n\t\t\t, files = []\n\t\t\t, ruid\n\t\t\t;\n\n\t\t\tfunction filterFile(file, cb) {\n\t\t\t\tvar queue = [];\n\t\t\t\to.each(self.settings.filters, function(rule, name) {\n\t\t\t\t\tif (fileFilters[name]) {\n\t\t\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\t\t\tfileFilters[name].call(self, rule, file, function(res) {\n\t\t\t\t\t\t\t\tcb(!res);\n\t\t\t\t\t\t\t});\n\t\t\t\t\t\t});\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t\to.inSeries(queue, cb);\n\t\t\t}\n\n\t\t\t/**\n\t\t\t * @method resolveFile\n\t\t\t * @private\n\t\t\t * @param {o.File|o.Blob|plupload.File|File|Blob|input[type=\"file\"]} file\n\t\t\t */\n\t\t\tfunction resolveFile(file) {\n\t\t\t\tvar type = o.typeOf(file);\n\n\t\t\t\t// o.File\n\t\t\t\tif (file instanceof o.File) { \n\t\t\t\t\tif (!file.ruid && !file.isDetached()) {\n\t\t\t\t\t\tif (!ruid) { // weird case\n\t\t\t\t\t\t\treturn false;\n\t\t\t\t\t\t}\n\t\t\t\t\t\tfile.ruid = ruid;\n\t\t\t\t\t\tfile.connectRuntime(ruid);\n\t\t\t\t\t}\n\t\t\t\t\tresolveFile(new plupload.File(file));\n\t\t\t\t}\n\t\t\t\t// o.Blob \n\t\t\t\telse if (file instanceof o.Blob) {\n\t\t\t\t\tresolveFile(file.getSource());\n\t\t\t\t\tfile.destroy();\n\t\t\t\t} \n\t\t\t\t// plupload.File - final step for other branches\n\t\t\t\telse if (file instanceof plupload.File) {\n\t\t\t\t\tif (fileName) {\n\t\t\t\t\t\tfile.name = fileName;\n\t\t\t\t\t}\n\t\t\t\t\t\n\t\t\t\t\tqueue.push(function(cb) {\n\t\t\t\t\t\t// run through the internal and user-defined filters, if any\n\t\t\t\t\t\tfilterFile(file, function(err) {\n\t\t\t\t\t\t\tif (!err) {\n\t\t\t\t\t\t\t\tfiles.push(file);\n\t\t\t\t\t\t\t\tself.trigger(\"FileFiltered\", file);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tdelay(cb, 1); // do not build up recursions or eventually we might hit the limits\n\t\t\t\t\t\t});\n\t\t\t\t\t});\n\t\t\t\t} \n\t\t\t\t// native File or blob\n\t\t\t\telse if (o.inArray(type, ['file', 'blob']) !== -1) {\n\t\t\t\t\tresolveFile(new o.File(null, file));\n\t\t\t\t} \n\t\t\t\t// input[type=\"file\"]\n\t\t\t\telse if (type === 'node' && o.typeOf(file.files) === 'filelist') {\n\t\t\t\t\t// if we are dealing with input[type=\"file\"]\n\t\t\t\t\to.each(file.files, resolveFile);\n\t\t\t\t} \n\t\t\t\t// mixed array of any supported types (see above)\n\t\t\t\telse if (type === 'array') {\n\t\t\t\t\tfileName = null; // should never happen, but unset anyway to avoid funny situations\n\t\t\t\t\to.each(file, resolveFile);\n\t\t\t\t}\n\t\t\t}\n\n\t\t\truid = getRUID();\n\t\t\t\n\t\t\tresolveFile(file);\n\n\t\t\tif (queue.length) {\n\t\t\t\to.inSeries(queue, function() {\n\t\t\t\t\t// if any files left after filtration, trigger FilesAdded\n\t\t\t\t\tif (files.length) {\n\t\t\t\t\t\tself.trigger(\"FilesAdded\", files);\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes a specific file.\n\t\t *\n\t\t * @method removeFile\n\t\t * @param {plupload.File|String} file File to remove from queue.\n\t\t */\n\t\tremoveFile : function(file) {\n\t\t\tvar id = typeof(file) === 'string' ? file : file.id;\n\n\t\t\tfor (var i = files.length - 1; i >= 0; i--) {\n\t\t\t\tif (files[i].id === id) {\n\t\t\t\t\treturn this.splice(i, 1)[0];\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\n\t\t/**\n\t\t * Removes part of the queue and returns the files removed. This will also trigger the FilesRemoved and QueueChanged events.\n\t\t *\n\t\t * @method splice\n\t\t * @param {Number} start (Optional) Start index to remove from.\n\t\t * @param {Number} length (Optional) Lengh of items to remove.\n\t\t * @return {Array} Array of files that was removed.\n\t\t */\n\t\tsplice : function(start, length) {\n\t\t\t// Splice and trigger events\n\t\t\tvar removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);\n\n\t\t\tthis.trigger(\"FilesRemoved\", removed);\n\n\t\t\t// Dispose any resources allocated by those files\n\t\t\tplupload.each(removed, function(file) {\n\t\t\t\tfile.destroy();\n\t\t\t});\n\n\t\t\tthis.trigger(\"QueueChanged\");\n\t\t\tthis.refresh();\n\n\t\t\treturn removed;\n\t\t},\n\n\t\t/**\n\t\t * Dispatches the specified event name and it's arguments to all listeners.\n\t\t *\n\t\t *\n\t\t * @method trigger\n\t\t * @param {String} name Event name to fire.\n\t\t * @param {Object..} Multiple arguments to pass along to the listener functions.\n\t\t */\n\n\t\t/**\n\t\t * Check whether uploader has any listeners to the specified event.\n\t\t *\n\t\t * @method hasEventListener\n\t\t * @param {String} name Event name to check for.\n\t\t */\n\n\n\t\t/**\n\t\t * Adds an event listener by name.\n\t\t *\n\t\t * @method bind\n\t\t * @param {String} name Event name to listen for.\n\t\t * @param {function} func Function to call ones the event gets fired.\n\t\t * @param {Object} scope Optional scope to execute the specified function in.\n\t\t */\n\t\tbind : function(name, func, scope) {\n\t\t\tvar self = this;\n\t\t\t// adapt moxie EventTarget style to Plupload-like\n\t\t\tplupload.Uploader.prototype.bind.call(this, name, function() {\n\t\t\t\tvar args = [].slice.call(arguments);\n\t\t\t\targs.splice(0, 1, self); // replace event object with uploader instance\n\t\t\t\treturn func.apply(this, args);\n\t\t\t}, 0, scope);\n\t\t},\n\n\t\t/**\n\t\t * Removes the specified event listener.\n\t\t *\n\t\t * @method unbind\n\t\t * @param {String} name Name of event to remove.\n\t\t * @param {function} func Function to remove from listener.\n\t\t */\n\n\t\t/**\n\t\t * Removes all event listeners.\n\t\t *\n\t\t * @method unbindAll\n\t\t */\n\n\n\t\t/**\n\t\t * Destroys Plupload instance and cleans after itself.\n\t\t *\n\t\t * @method destroy\n\t\t */\n\t\tdestroy : function() {\n\t\t\tthis.trigger('Destroy');\n\t\t\ttotal = null; // purge this one exclusively\n\t\t\tthis.unbindAll();\n\t\t}\n\t});\n};\n\nplupload.Uploader.prototype = o.EventTarget.instance;\n\n/**\n * Constructs a new file instance.\n *\n * @class File\n * @constructor\n * \n * @param {Object} file Object containing file properties\n * @param {String} file.name Name of the file.\n * @param {Number} file.size File size.\n */\nplupload.File = (function() {\n\tvar filepool = {};\n\n\tfunction PluploadFile(file) {\n\n\t\tplupload.extend(this, {\n\n\t\t\t/**\n\t\t\t * File id this is a globally unique id for the specific file.\n\t\t\t *\n\t\t\t * @property id\n\t\t\t * @type String\n\t\t\t */\n\t\t\tid: plupload.guid(),\n\n\t\t\t/**\n\t\t\t * File name for example \"myfile.gif\".\n\t\t\t *\n\t\t\t * @property name\n\t\t\t * @type String\n\t\t\t */\n\t\t\tname: file.name || file.fileName,\n\n\t\t\t/**\n\t\t\t * File type, `e.g image/jpeg`\n\t\t\t *\n\t\t\t * @property type\n\t\t\t * @type String\n\t\t\t */\n\t\t\ttype: file.type || '',\n\n\t\t\t/**\n\t\t\t * File size in bytes (may change after client-side manupilation).\n\t\t\t *\n\t\t\t * @property size\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tsize: file.size || file.fileSize,\n\n\t\t\t/**\n\t\t\t * Original file size in bytes.\n\t\t\t *\n\t\t\t * @property origSize\n\t\t\t * @type Number\n\t\t\t */\n\t\t\torigSize: file.size || file.fileSize,\n\n\t\t\t/**\n\t\t\t * Number of bytes uploaded of the files total size.\n\t\t\t *\n\t\t\t * @property loaded\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tloaded: 0,\n\n\t\t\t/**\n\t\t\t * Number of percentage uploaded of the file.\n\t\t\t *\n\t\t\t * @property percent\n\t\t\t * @type Number\n\t\t\t */\n\t\t\tpercent: 0,\n\n\t\t\t/**\n\t\t\t * Status constant matching the plupload states QUEUED, UPLOADING, FAILED, DONE.\n\t\t\t *\n\t\t\t * @property status\n\t\t\t * @type Number\n\t\t\t * @see plupload\n\t\t\t */\n\t\t\tstatus: plupload.QUEUED,\n\n\t\t\t/**\n\t\t\t * Date of last modification.\n\t\t\t *\n\t\t\t * @property lastModifiedDate\n\t\t\t * @type {String}\n\t\t\t */\n\t\t\tlastModifiedDate: file.lastModifiedDate || (new Date()).toLocaleString(), // Thu Aug 23 2012 19:40:00 GMT+0400 (GET)\n\n\t\t\t/**\n\t\t\t * Returns native window.File object, when it's available.\n\t\t\t *\n\t\t\t * @method getNative\n\t\t\t * @return {window.File} or null, if plupload.File is of different origin\n\t\t\t */\n\t\t\tgetNative: function() {\n\t\t\t\tvar file = this.getSource().getSource();\n\t\t\t\treturn o.inArray(o.typeOf(file), ['blob', 'file']) !== -1 ? file : null;\n\t\t\t},\n\n\t\t\t/**\n\t\t\t * Returns mOxie.File - unified wrapper object that can be used across runtimes.\n\t\t\t *\n\t\t\t * @method getSource\n\t\t\t * @return {mOxie.File} or null\n\t\t\t */\n\t\t\tgetSource: function() {\n\t\t\t\tif (!filepool[this.id]) {\n\t\t\t\t\treturn null;\n\t\t\t\t}\n\t\t\t\treturn filepool[this.id];\n\t\t\t},\n\n\t\t\t/**\n\t\t\t * Destroys plupload.File object.\n\t\t\t *\n\t\t\t * @method destroy\n\t\t\t */\n\t\t\tdestroy: function() {\n\t\t\t\tvar src = this.getSource();\n\t\t\t\tif (src) {\n\t\t\t\t\tsrc.destroy();\n\t\t\t\t\tdelete filepool[this.id];\n\t\t\t\t}\n\t\t\t}\n\t\t});\n\n\t\tfilepool[this.id] = file;\n\t}\n\n\treturn PluploadFile;\n}());\n\n\n/**\n * Constructs a queue progress.\n *\n * @class QueueProgress\n * @constructor\n */\n plupload.QueueProgress = function() {\n\tvar self = this; // Setup alias for self to reduce code size when it's compressed\n\n\t/**\n\t * Total queue file size.\n\t *\n\t * @property size\n\t * @type Number\n\t */\n\tself.size = 0;\n\n\t/**\n\t * Total bytes uploaded.\n\t *\n\t * @property loaded\n\t * @type Number\n\t */\n\tself.loaded = 0;\n\n\t/**\n\t * Number of files uploaded.\n\t *\n\t * @property uploaded\n\t * @type Number\n\t */\n\tself.uploaded = 0;\n\n\t/**\n\t * Number of files failed to upload.\n\t *\n\t * @property failed\n\t * @type Number\n\t */\n\tself.failed = 0;\n\n\t/**\n\t * Number of files yet to be uploaded.\n\t *\n\t * @property queued\n\t * @type Number\n\t */\n\tself.queued = 0;\n\n\t/**\n\t * Total percent of the uploaded bytes.\n\t *\n\t * @property percent\n\t * @type Number\n\t */\n\tself.percent = 0;\n\n\t/**\n\t * Bytes uploaded per second.\n\t *\n\t * @property bytesPerSec\n\t * @type Number\n\t */\n\tself.bytesPerSec = 0;\n\n\t/**\n\t * Resets the progress to it's initial values.\n\t *\n\t * @method reset\n\t */\n\tself.reset = function() {\n\t\tself.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;\n\t};\n};\n\nwindow.plupload = plupload;\n\n}(window, mOxie));\n");
__$coverInitRange("Plupload", "223:223");
__$coverInitRange("Plupload", "224:56449");
__$coverInitRange("Plupload", "255:303");
__$coverInitRange("Plupload", "304:304");
__$coverInitRange("Plupload", "364:1834");
__$coverInitRange("Plupload", "1878:15361");
__$coverInitRange("Plupload", "15365:15676");
__$coverInitRange("Plupload", "15680:16023");
__$coverInitRange("Plupload", "16027:16543");
__$coverInitRange("Plupload", "19852:52532");
__$coverInitRange("Plupload", "52535:52587");
__$coverInitRange("Plupload", "52816:55227");
__$coverInitRange("Plupload", "55315:56400");
__$coverInitRange("Plupload", "56403:56429");
__$coverInitRange("Plupload", "402:454");
__$coverInitRange("Plupload", "458:1114");
__$coverInitRange("Plupload", "1118:1816");
__$coverInitRange("Plupload", "1821:1832");
__$coverInitRange("Plupload", "606:1003");
__$coverInitRange("Plupload", "1008:1111");
__$coverInitRange("Plupload", "1031:1057");
__$coverInitRange("Plupload", "1086:1107");
__$coverInitRange("Plupload", "1157:1249");
__$coverInitRange("Plupload", "1221:1243");
__$coverInitRange("Plupload", "1298:1381");
__$coverInitRange("Plupload", "1352:1375");
__$coverInitRange("Plupload", "1460:1561");
__$coverInitRange("Plupload", "1566:1626");
__$coverInitRange("Plupload", "1631:1699");
__$coverInitRange("Plupload", "1706:1813");
__$coverInitRange("Plupload", "1527:1557");
__$coverInitRange("Plupload", "1600:1622");
__$coverInitRange("Plupload", "1665:1695");
__$coverInitRange("Plupload", "1760:1791");
__$coverInitRange("Plupload", "6485:6501");
__$coverInitRange("Plupload", "6506:6557");
__$coverInitRange("Plupload", "6562:6580");
__$coverInitRange("Plupload", "6584:6659");
__$coverInitRange("Plupload", "6664:6694");
__$coverInitRange("Plupload", "6542:6553");
__$coverInitRange("Plupload", "6601:6619");
__$coverInitRange("Plupload", "6624:6655");
__$coverInitRange("Plupload", "6638:6650");
__$coverInitRange("Plupload", "7845:7963");
__$coverInitRange("Plupload", "7968:8114");
__$coverInitRange("Plupload", "8036:8102");
__$coverInitRange("Plupload", "11763:11776");
__$coverInitRange("Plupload", "11805:12105");
__$coverInitRange("Plupload", "12110:12203");
__$coverInitRange("Plupload", "12232:12264");
__$coverInitRange("Plupload", "12295:12339");
__$coverInitRange("Plupload", "12344:12355");
__$coverInitRange("Plupload", "12154:12199");
__$coverInitRange("Plupload", "12755:12769");
__$coverInitRange("Plupload", "12774:12916");
__$coverInitRange("Plupload", "12921:12990");
__$coverInitRange("Plupload", "12995:13005");
__$coverInitRange("Plupload", "12822:12910");
__$coverInitRange("Plupload", "12937:12986");
__$coverInitRange("Plupload", "13270:13350");
__$coverInitRange("Plupload", "13363:13473");
__$coverInitRange("Plupload", "13486:13590");
__$coverInitRange("Plupload", "13603:13701");
__$coverInitRange("Plupload", "13714:13806");
__$coverInitRange("Plupload", "13811:13854");
__$coverInitRange("Plupload", "13314:13346");
__$coverInitRange("Plupload", "13394:13469");
__$coverInitRange("Plupload", "13514:13586");
__$coverInitRange("Plupload", "13628:13697");
__$coverInitRange("Plupload", "13736:13802");
__$coverInitRange("Plupload", "14547:14562");
__$coverInitRange("Plupload", "14567:14601");
__$coverInitRange("Plupload", "14605:14695");
__$coverInitRange("Plupload", "14699:14711");
__$coverInitRange("Plupload", "14715:14729");
__$coverInitRange("Plupload", "15333:15355");
__$coverInitRange("Plupload", "15433:15672");
__$coverInitRange("Plupload", "15492:15634");
__$coverInitRange("Plupload", "15638:15647");
__$coverInitRange("Plupload", "15661:15669");
__$coverInitRange("Plupload", "15751:15760");
__$coverInitRange("Plupload", "15786:16019");
__$coverInitRange("Plupload", "15849:15981");
__$coverInitRange("Plupload", "15985:15994");
__$coverInitRange("Plupload", "16008:16016");
__$coverInitRange("Plupload", "16101:16528");
__$coverInitRange("Plupload", "16531:16539");
__$coverInitRange("Plupload", "16116:16142");
__$coverInitRange("Plupload", "16146:16525");
__$coverInitRange("Plupload", "16257:16521");
__$coverInitRange("Plupload", "16339:16489");
__$coverInitRange("Plupload", "16495:16504");
__$coverInitRange("Plupload", "16510:16516");
__$coverInitRange("Plupload", "24030:24191");
__$coverInitRange("Plupload", "24192:24192");
__$coverInitRange("Plupload", "24217:24867");
__$coverInitRange("Plupload", "24872:24990");
__$coverInitRange("Plupload", "24995:26106");
__$coverInitRange("Plupload", "26111:26244");
__$coverInitRange("Plupload", "26249:26412");
__$coverInitRange("Plupload", "26417:26873");
__$coverInitRange("Plupload", "26878:29846");
__$coverInitRange("Plupload", "29851:30262");
__$coverInitRange("Plupload", "30267:33454");
__$coverInitRange("Plupload", "33487:33645");
__$coverInitRange("Plupload", "33650:33910");
__$coverInitRange("Plupload", "33915:39613");
__$coverInitRange("Plupload", "39618:39675");
__$coverInitRange("Plupload", "39680:40075");
__$coverInitRange("Plupload", "40080:40142");
__$coverInitRange("Plupload", "40147:40363");
__$coverInitRange("Plupload", "40368:40814");
__$coverInitRange("Plupload", "40819:41322");
__$coverInitRange("Plupload", "41348:41831");
__$coverInitRange("Plupload", "41837:41878");
__$coverInitRange("Plupload", "41905:41941");
__$coverInitRange("Plupload", "41969:52529");
__$coverInitRange("Plupload", "24243:24265");
__$coverInitRange("Plupload", "24270:24864");
__$coverInitRange("Plupload", "24340:24624");
__$coverInitRange("Plupload", "24665:24860");
__$coverInitRange("Plupload", "24381:24619");
__$coverInitRange("Plupload", "24437:24452");
__$coverInitRange("Plupload", "24459:24586");
__$coverInitRange("Plupload", "24507:24539");
__$coverInitRange("Plupload", "24547:24579");
__$coverInitRange("Plupload", "24606:24613");
__$coverInitRange("Plupload", "24698:24812");
__$coverInitRange("Plupload", "24818:24855");
__$coverInitRange("Plupload", "24742:24771");
__$coverInitRange("Plupload", "24778:24806");
__$coverInitRange("Plupload", "24900:24977");
__$coverInitRange("Plupload", "24981:24987");
__$coverInitRange("Plupload", "25015:25026");
__$coverInitRange("Plupload", "25048:25061");
__$coverInitRange("Plupload", "25115:25698");
__$coverInitRange("Plupload", "25796:26103");
__$coverInitRange("Plupload", "25155:25170");
__$coverInitRange("Plupload", "25176:25527");
__$coverInitRange("Plupload", "25533:25694");
__$coverInitRange("Plupload", "25262:25289");
__$coverInitRange("Plupload", "25431:25486");
__$coverInitRange("Plupload", "25504:25522");
__$coverInitRange("Plupload", "25573:25589");
__$coverInitRange("Plupload", "25643:25657");
__$coverInitRange("Plupload", "25675:25689");
__$coverInitRange("Plupload", "25827:25912");
__$coverInitRange("Plupload", "25928:26015");
__$coverInitRange("Plupload", "26020:26099");
__$coverInitRange("Plupload", "26134:26174");
__$coverInitRange("Plupload", "26178:26225");
__$coverInitRange("Plupload", "26229:26241");
__$coverInitRange("Plupload", "26193:26221");
__$coverInitRange("Plupload", "26284:26393");
__$coverInitRange("Plupload", "26397:26409");
__$coverInitRange("Plupload", "26304:26343");
__$coverInitRange("Plupload", "26348:26389");
__$coverInitRange("Plupload", "26364:26384");
__$coverInitRange("Plupload", "26451:26488");
__$coverInitRange("Plupload", "26493:26534");
__$coverInitRange("Plupload", "26541:26582");
__$coverInitRange("Plupload", "26587:26624");
__$coverInitRange("Plupload", "26629:26674");
__$coverInitRange("Plupload", "26679:26720");
__$coverInitRange("Plupload", "26725:26756");
__$coverInitRange("Plupload", "26761:26788");
__$coverInitRange("Plupload", "26793:26834");
__$coverInitRange("Plupload", "26839:26870");
__$coverInitRange("Plupload", "26918:26957");
__$coverInitRange("Plupload", "26983:27237");
__$coverInitRange("Plupload", "27283:27432");
__$coverInitRange("Plupload", "27486:29048");
__$coverInitRange("Plupload", "29080:29745");
__$coverInitRange("Plupload", "29751:29843");
__$coverInitRange("Plupload", "27356:27426");
__$coverInitRange("Plupload", "27385:27421");
__$coverInitRange("Plupload", "27519:29044");
__$coverInitRange("Plupload", "27576:29037");
__$coverInitRange("Plupload", "27607:27818");
__$coverInitRange("Plupload", "27826:28186");
__$coverInitRange("Plupload", "28194:28266");
__$coverInitRange("Plupload", "28274:28904");
__$coverInitRange("Plupload", "28912:29005");
__$coverInitRange("Plupload", "29013:29029");
__$coverInitRange("Plupload", "27865:27904");
__$coverInitRange("Plupload", "27949:28120");
__$coverInitRange("Plupload", "28129:28137");
__$coverInitRange("Plupload", "28145:28166");
__$coverInitRange("Plupload", "28174:28178");
__$coverInitRange("Plupload", "28234:28258");
__$coverInitRange("Plupload", "28352:28895");
__$coverInitRange("Plupload", "28376:28627");
__$coverInitRange("Plupload", "28637:28887");
__$coverInitRange("Plupload", "28420:28618");
__$coverInitRange("Plupload", "28460:28504");
__$coverInitRange("Plupload", "28561:28608");
__$coverInitRange("Plupload", "28682:28878");
__$coverInitRange("Plupload", "28721:28766");
__$coverInitRange("Plupload", "28820:28868");
__$coverInitRange("Plupload", "28968:28984");
__$coverInitRange("Plupload", "28992:28996");
__$coverInitRange("Plupload", "29112:29741");
__$coverInitRange("Plupload", "29168:29734");
__$coverInitRange("Plupload", "29199:29288");
__$coverInitRange("Plupload", "29296:29527");
__$coverInitRange("Plupload", "29535:29604");
__$coverInitRange("Plupload", "29612:29703");
__$coverInitRange("Plupload", "29711:29726");
__$coverInitRange("Plupload", "29334:29373");
__$coverInitRange("Plupload", "29382:29432");
__$coverInitRange("Plupload", "29471:29479");
__$coverInitRange("Plupload", "29487:29507");
__$coverInitRange("Plupload", "29515:29519");
__$coverInitRange("Plupload", "29572:29596");
__$coverInitRange("Plupload", "29667:29682");
__$coverInitRange("Plupload", "29690:29694");
__$coverInitRange("Plupload", "29785:29837");
__$coverInitRange("Plupload", "29822:29832");
__$coverInitRange("Plupload", "29894:29917");
__$coverInitRange("Plupload", "29922:30259");
__$coverInitRange("Plupload", "29931:30046");
__$coverInitRange("Plupload", "30052:30155");
__$coverInitRange("Plupload", "30161:30206");
__$coverInitRange("Plupload", "30212:30226");
__$coverInitRange("Plupload", "29961:30040");
__$coverInitRange("Plupload", "30084:30129");
__$coverInitRange("Plupload", "30135:30149");
__$coverInitRange("Plupload", "30192:30200");
__$coverInitRange("Plupload", "30247:30255");
__$coverInitRange("Plupload", "30311:30350");
__$coverInitRange("Plupload", "30355:32494");
__$coverInitRange("Plupload", "32499:32678");
__$coverInitRange("Plupload", "32683:33451");
__$coverInitRange("Plupload", "30401:30432");
__$coverInitRange("Plupload", "30438:32408");
__$coverInitRange("Plupload", "32414:32490");
__$coverInitRange("Plupload", "30510:30708");
__$coverInitRange("Plupload", "30715:30720");
__$coverInitRange("Plupload", "30557:30581");
__$coverInitRange("Plupload", "30589:30701");
__$coverInitRange("Plupload", "30630:30693");
__$coverInitRange("Plupload", "30791:30888");
__$coverInitRange("Plupload", "30896:31007");
__$coverInitRange("Plupload", "31101:31725");
__$coverInitRange("Plupload", "31732:31737");
__$coverInitRange("Plupload", "30839:30881");
__$coverInitRange("Plupload", "30914:30954");
__$coverInitRange("Plupload", "30976:31000");
__$coverInitRange("Plupload", "31131:31718");
__$coverInitRange("Plupload", "31196:31221");
__$coverInitRange("Plupload", "31231:31606");
__$coverInitRange("Plupload", "31616:31679");
__$coverInitRange("Plupload", "31281:31595");
__$coverInitRange("Plupload", "31350:31583");
__$coverInitRange("Plupload", "31390:31419");
__$coverInitRange("Plupload", "31449:31572");
__$coverInitRange("Plupload", "31765:31906");
__$coverInitRange("Plupload", "31913:31918");
__$coverInitRange("Plupload", "31783:31854");
__$coverInitRange("Plupload", "31876:31899");
__$coverInitRange("Plupload", "31957:32032");
__$coverInitRange("Plupload", "32039:32044");
__$coverInitRange("Plupload", "32104:32131");
__$coverInitRange("Plupload", "32268:32292");
__$coverInitRange("Plupload", "32299:32346");
__$coverInitRange("Plupload", "32353:32358");
__$coverInitRange("Plupload", "32318:32339");
__$coverInitRange("Plupload", "32379:32403");
__$coverInitRange("Plupload", "32431:32485");
__$coverInitRange("Plupload", "32537:32627");
__$coverInitRange("Plupload", "32589:32620");
__$coverInitRange("Plupload", "32643:32674");
__$coverInitRange("Plupload", "32748:32821");
__$coverInitRange("Plupload", "32925:33022");
__$coverInitRange("Plupload", "33058:33081");
__$coverInitRange("Plupload", "33090:33447");
__$coverInitRange("Plupload", "33147:33440");
__$coverInitRange("Plupload", "33166:33214");
__$coverInitRange("Plupload", "33221:33268");
__$coverInitRange("Plupload", "33275:33299");
__$coverInitRange("Plupload", "33319:33434");
__$coverInitRange("Plupload", "33560:33595");
__$coverInitRange("Plupload", "33600:33626");
__$coverInitRange("Plupload", "33630:33642");
__$coverInitRange("Plupload", "33726:33907");
__$coverInitRange("Plupload", "33758:33815");
__$coverInitRange("Plupload", "33820:33860");
__$coverInitRange("Plupload", "33865:33903");
__$coverInitRange("Plupload", "33839:33855");
__$coverInitRange("Plupload", "33951:34106");
__$coverInitRange("Plupload", "34107:34107");
__$coverInitRange("Plupload", "34160:34256");
__$coverInitRange("Plupload", "34261:34657");
__$coverInitRange("Plupload", "34662:39193");
__$coverInitRange("Plupload", "39198:39221");
__$coverInitRange("Plupload", "39254:39610");
__$coverInitRange("Plupload", "34182:34252");
__$coverInitRange("Plupload", "34289:34653");
__$coverInitRange("Plupload", "34314:34342");
__$coverInitRange("Plupload", "34360:34380");
__$coverInitRange("Plupload", "34409:34648");
__$coverInitRange("Plupload", "34694:34737");
__$coverInitRange("Plupload", "34770:34887");
__$coverInitRange("Plupload", "34918:34963");
__$coverInitRange("Plupload", "34969:35275");
__$coverInitRange("Plupload", "35384:35737");
__$coverInitRange("Plupload", "35743:35771");
__$coverInitRange("Plupload", "35818:35988");
__$coverInitRange("Plupload", "35994:37532");
__$coverInitRange("Plupload", "37538:37588");
__$coverInitRange("Plupload", "37594:37663");
__$coverInitRange("Plupload", "37699:39189");
__$coverInitRange("Plupload", "34876:34882");
__$coverInitRange("Plupload", "35093:35147");
__$coverInitRange("Plupload", "35153:35206");
__$coverInitRange("Plupload", "35224:35248");
__$coverInitRange("Plupload", "35254:35270");
__$coverInitRange("Plupload", "35460:35732");
__$coverInitRange("Plupload", "35502:35544");
__$coverInitRange("Plupload", "35551:35597");
__$coverInitRange("Plupload", "35677:35697");
__$coverInitRange("Plupload", "35704:35726");
__$coverInitRange("Plupload", "35840:35983");
__$coverInitRange("Plupload", "35883:35935");
__$coverInitRange("Plupload", "35942:35976");
__$coverInitRange("Plupload", "36067:36129");
__$coverInitRange("Plupload", "36136:36169");
__$coverInitRange("Plupload", "36226:36898");
__$coverInitRange("Plupload", "36905:36932");
__$coverInitRange("Plupload", "36987:37526");
__$coverInitRange("Plupload", "36097:36110");
__$coverInitRange("Plupload", "36117:36123");
__$coverInitRange("Plupload", "36263:36282");
__$coverInitRange("Plupload", "36290:36312");
__$coverInitRange("Plupload", "36319:36360");
__$coverInitRange("Plupload", "36368:36577");
__$coverInitRange("Plupload", "36690:36848");
__$coverInitRange("Plupload", "36807:36841");
__$coverInitRange("Plupload", "36869:36892");
__$coverInitRange("Plupload", "37077:37157");
__$coverInitRange("Plupload", "37165:37199");
__$coverInitRange("Plupload", "37207:37234");
__$coverInitRange("Plupload", "37242:37397");
__$coverInitRange("Plupload", "37117:37131");
__$coverInitRange("Plupload", "37139:37150");
__$coverInitRange("Plupload", "37443:37468");
__$coverInitRange("Plupload", "37569:37582");
__$coverInitRange("Plupload", "37627:37641");
__$coverInitRange("Plupload", "37647:37657");
__$coverInitRange("Plupload", "37755:37796");
__$coverInitRange("Plupload", "37803:37830");
__$coverInitRange("Plupload", "37863:37968");
__$coverInitRange("Plupload", "37975:38002");
__$coverInitRange("Plupload", "38037:38169");
__$coverInitRange("Plupload", "38204:38258");
__$coverInitRange("Plupload", "38264:38508");
__$coverInitRange("Plupload", "37927:37960");
__$coverInitRange("Plupload", "38133:38161");
__$coverInitRange("Plupload", "38572:38665");
__$coverInitRange("Plupload", "38672:38699");
__$coverInitRange("Plupload", "38706:38770");
__$coverInitRange("Plupload", "38827:38932");
__$coverInitRange("Plupload", "38939:39184");
__$coverInitRange("Plupload", "38891:38924");
__$coverInitRange("Plupload", "39414:39573");
__$coverInitRange("Plupload", "39491:39509");
__$coverInitRange("Plupload", "39515:39543");
__$coverInitRange("Plupload", "39549:39566");
__$coverInitRange("Plupload", "39589:39606");
__$coverInitRange("Plupload", "39658:39672");
__$coverInitRange("Plupload", "39712:40072");
__$coverInitRange("Plupload", "39789:39814");
__$coverInitRange("Plupload", "39902:40068");
__$coverInitRange("Plupload", "39955:40063");
__$coverInitRange("Plupload", "40008:40044");
__$coverInitRange("Plupload", "40051:40057");
__$coverInitRange("Plupload", "40110:40139");
__$coverInitRange("Plupload", "40124:40135");
__$coverInitRange("Plupload", "40179:40185");
__$coverInitRange("Plupload", "40310:40360");
__$coverInitRange("Plupload", "40332:40351");
__$coverInitRange("Plupload", "40451:40811");
__$coverInitRange("Plupload", "40470:40503");
__$coverInitRange("Plupload", "40508:40526");
__$coverInitRange("Plupload", "40654:40807");
__$coverInitRange("Plupload", "40716:40742");
__$coverInitRange("Plupload", "40748:40802");
__$coverInitRange("Plupload", "40772:40791");
__$coverInitRange("Plupload", "40846:40855");
__$coverInitRange("Plupload", "40881:40942");
__$coverInitRange("Plupload", "40946:40956");
__$coverInitRange("Plupload", "40961:41091");
__$coverInitRange("Plupload", "41096:41221");
__$coverInitRange("Plupload", "41226:41245");
__$coverInitRange("Plupload", "41249:41265");
__$coverInitRange("Plupload", "41269:41302");
__$coverInitRange("Plupload", "41306:41319");
__$coverInitRange("Plupload", "40922:40936");
__$coverInitRange("Plupload", "40989:41067");
__$coverInitRange("Plupload", "41072:41087");
__$coverInitRange("Plupload", "41041:41060");
__$coverInitRange("Plupload", "41123:41198");
__$coverInitRange("Plupload", "41203:41217");
__$coverInitRange("Plupload", "41173:41191");
__$coverInitRange("Plupload", "43523:43538");
__$coverInitRange("Plupload", "43544:43728");
__$coverInitRange("Plupload", "43767:43948");
__$coverInitRange("Plupload", "43954:43983");
__$coverInitRange("Plupload", "43989:44534");
__$coverInitRange("Plupload", "43594:43616");
__$coverInitRange("Plupload", "43634:43723");
__$coverInitRange("Plupload", "43694:43715");
__$coverInitRange("Plupload", "43819:43931");
__$coverInitRange("Plupload", "43937:43943");
__$coverInitRange("Plupload", "44046:44227");
__$coverInitRange("Plupload", "44234:44527");
__$coverInitRange("Plupload", "44094:44113");
__$coverInitRange("Plupload", "44133:44221");
__$coverInitRange("Plupload", "44191:44212");
__$coverInitRange("Plupload", "44253:44301");
__$coverInitRange("Plupload", "44308:44355");
__$coverInitRange("Plupload", "44362:44386");
__$coverInitRange("Plupload", "44406:44521");
__$coverInitRange("Plupload", "44873:44923");
__$coverInitRange("Plupload", "45284:45323");
__$coverInitRange("Plupload", "45328:45351");
__$coverInitRange("Plupload", "45303:45318");
__$coverInitRange("Plupload", "45588:45711");
__$coverInitRange("Plupload", "45716:45739");
__$coverInitRange("Plupload", "45617:45706");
__$coverInitRange("Plupload", "45670:45698");
__$coverInitRange("Plupload", "45849:45987");
__$coverInitRange("Plupload", "45891:45920");
__$coverInitRange("Plupload", "45926:45954");
__$coverInitRange("Plupload", "45961:45982");
__$coverInitRange("Plupload", "46098:46242");
__$coverInitRange("Plupload", "46140:46169");
__$coverInitRange("Plupload", "46175:46203");
__$coverInitRange("Plupload", "46209:46237");
__$coverInitRange("Plupload", "46452:46507");
__$coverInitRange("Plupload", "46513:46635");
__$coverInitRange("Plupload", "46641:46680");
__$coverInitRange("Plupload", "46542:46630");
__$coverInitRange("Plupload", "46595:46622");
__$coverInitRange("Plupload", "46921:46926");
__$coverInitRange("Plupload", "46931:47034");
__$coverInitRange("Plupload", "46977:47029");
__$coverInitRange("Plupload", "47008:47023");
__$coverInitRange("Plupload", "47573:47634");
__$coverInitRange("Plupload", "47635:47635");
__$coverInitRange("Plupload", "47641:47960");
__$coverInitRange("Plupload", "48098:49599");
__$coverInitRange("Plupload", "49605:49621");
__$coverInitRange("Plupload", "49630:49647");
__$coverInitRange("Plupload", "49653:49855");
__$coverInitRange("Plupload", "47677:47691");
__$coverInitRange("Plupload", "47697:47928");
__$coverInitRange("Plupload", "47934:47955");
__$coverInitRange("Plupload", "47755:47920");
__$coverInitRange("Plupload", "47786:47913");
__$coverInitRange("Plupload", "47819:47903");
__$coverInitRange("Plupload", "47884:47892");
__$coverInitRange("Plupload", "48131:48156");
__$coverInitRange("Plupload", "48177:49594");
__$coverInitRange("Plupload", "48213:48377");
__$coverInitRange("Plupload", "48384:48420");
__$coverInitRange("Plupload", "48259:48313");
__$coverInitRange("Plupload", "48321:48337");
__$coverInitRange("Plupload", "48345:48370");
__$coverInitRange("Plupload", "48293:48305");
__$coverInitRange("Plupload", "48487:48516");
__$coverInitRange("Plupload", "48523:48537");
__$coverInitRange("Plupload", "48650:48699");
__$coverInitRange("Plupload", "48712:49048");
__$coverInitRange("Plupload", "48672:48692");
__$coverInitRange("Plupload", "48811:49039");
__$coverInitRange("Plupload", "48851:48940");
__$coverInitRange("Plupload", "48949:48961");
__$coverInitRange("Plupload", "48871:48887");
__$coverInitRange("Plupload", "48897:48931");
__$coverInitRange("Plupload", "49146:49181");
__$coverInitRange("Plupload", "49342:49373");
__$coverInitRange("Plupload", "49474:49489");
__$coverInitRange("Plupload", "49563:49588");
__$coverInitRange("Plupload", "49677:49850");
__$coverInitRange("Plupload", "49776:49842");
__$coverInitRange("Plupload", "49802:49835");
__$coverInitRange("Plupload", "50036:50087");
__$coverInitRange("Plupload", "50093:50212");
__$coverInitRange("Plupload", "50143:50207");
__$coverInitRange("Plupload", "50174:50201");
__$coverInitRange("Plupload", "50641:50738");
__$coverInitRange("Plupload", "50744:50781");
__$coverInitRange("Plupload", "50840:50905");
__$coverInitRange("Plupload", "50911:50939");
__$coverInitRange("Plupload", "50944:50958");
__$coverInitRange("Plupload", "50964:50978");
__$coverInitRange("Plupload", "50884:50898");
__$coverInitRange("Plupload", "51725:51740");
__$coverInitRange("Plupload", "51798:52028");
__$coverInitRange("Plupload", "51865:51900");
__$coverInitRange("Plupload", "51906:51929");
__$coverInitRange("Plupload", "51982:52011");
__$coverInitRange("Plupload", "52429:52452");
__$coverInitRange("Plupload", "52457:52469");
__$coverInitRange("Plupload", "52504:52520");
__$coverInitRange("Plupload", "52847:52864");
__$coverInitRange("Plupload", "52868:55198");
__$coverInitRange("Plupload", "55202:55221");
__$coverInitRange("Plupload", "52901:55166");
__$coverInitRange("Plupload", "55171:55195");
__$coverInitRange("Plupload", "54543:54582");
__$coverInitRange("Plupload", "54588:54659");
__$coverInitRange("Plupload", "54862:54910");
__$coverInitRange("Plupload", "54916:54940");
__$coverInitRange("Plupload", "54893:54904");
__$coverInitRange("Plupload", "55057:55083");
__$coverInitRange("Plupload", "55089:55155");
__$coverInitRange("Plupload", "55105:55118");
__$coverInitRange("Plupload", "55125:55149");
__$coverInitRange("Plupload", "55354:55369");
__$coverInitRange("Plupload", "55515:55528");
__$coverInitRange("Plupload", "55610:55625");
__$coverInitRange("Plupload", "55713:55730");
__$coverInitRange("Plupload", "55824:55839");
__$coverInitRange("Plupload", "55935:55950");
__$coverInitRange("Plupload", "56048:56064");
__$coverInitRange("Plupload", "56156:56176");
__$coverInitRange("Plupload", "56260:56397");
__$coverInitRange("Plupload", "56288:56393");
__$coverCall('Plupload', '223:223');
;
__$coverCall('Plupload', '224:56449');
(function (window, o, undef) {
    __$coverCall('Plupload', '255:303');
    var delay = window.setTimeout, fileFilters = {};
    __$coverCall('Plupload', '304:304');
    ;
    __$coverCall('Plupload', '364:1834');
    function normalizeCaps(settings) {
        __$coverCall('Plupload', '402:454');
        var features = settings.required_features, caps = {};
        __$coverCall('Plupload', '458:1114');
        function resolve(feature, value, strict) {
            __$coverCall('Plupload', '606:1003');
            var map = {
                    chunks: 'slice_blob',
                    jpgresize: 'send_binary_string',
                    pngresize: 'send_binary_string',
                    progress: 'report_upload_progress',
                    multi_selection: 'select_multiple',
                    max_file_size: 'access_binary',
                    dragdrop: 'drag_and_drop',
                    drop_element: 'drag_and_drop',
                    headers: 'send_custom_headers',
                    canSendBinary: 'send_binary',
                    triggerDialog: 'summon_file_dialog'
                };
            __$coverCall('Plupload', '1008:1111');
            if (map[feature]) {
                __$coverCall('Plupload', '1031:1057');
                caps[map[feature]] = value;
            } else if (!strict) {
                __$coverCall('Plupload', '1086:1107');
                caps[feature] = value;
            }
        }
        __$coverCall('Plupload', '1118:1816');
        if (typeof features === 'string') {
            __$coverCall('Plupload', '1157:1249');
            plupload.each(features.split(/\s*,\s*/), function (feature) {
                __$coverCall('Plupload', '1221:1243');
                resolve(feature, true);
            });
        } else if (typeof features === 'object') {
            __$coverCall('Plupload', '1298:1381');
            plupload.each(features, function (value, feature) {
                __$coverCall('Plupload', '1352:1375');
                resolve(feature, value);
            });
        } else if (features === true) {
            __$coverCall('Plupload', '1460:1561');
            if (!settings.multipart) {
                __$coverCall('Plupload', '1527:1557');
                caps.send_binary_string = true;
            }
            __$coverCall('Plupload', '1566:1626');
            if (settings.chunk_size > 0) {
                __$coverCall('Plupload', '1600:1622');
                caps.slice_blob = true;
            }
            __$coverCall('Plupload', '1631:1699');
            if (settings.resize.enabled) {
                __$coverCall('Plupload', '1665:1695');
                caps.send_binary_string = true;
            }
            __$coverCall('Plupload', '1706:1813');
            plupload.each(settings, function (value, feature) {
                __$coverCall('Plupload', '1760:1791');
                resolve(feature, !!value, true);
            });
        }
        __$coverCall('Plupload', '1821:1832');
        return caps;
    }
    __$coverCall('Plupload', '1878:15361');
    var plupload = {
            VERSION: '@@version@@',
            STOPPED: 1,
            STARTED: 2,
            QUEUED: 1,
            UPLOADING: 2,
            FAILED: 4,
            DONE: 5,
            GENERIC_ERROR: -100,
            HTTP_ERROR: -200,
            IO_ERROR: -300,
            SECURITY_ERROR: -400,
            INIT_ERROR: -500,
            FILE_SIZE_ERROR: -600,
            FILE_EXTENSION_ERROR: -601,
            FILE_DUPLICATE_ERROR: -602,
            IMAGE_FORMAT_ERROR: -700,
            IMAGE_MEMORY_ERROR: -701,
            IMAGE_DIMENSIONS_ERROR: -702,
            mimeTypes: o.mimes,
            ua: o.ua,
            typeOf: o.typeOf,
            extend: o.extend,
            guid: o.guid,
            get: function get(ids) {
                __$coverCall('Plupload', '6485:6501');
                var els = [], el;
                __$coverCall('Plupload', '6506:6557');
                if (o.typeOf(ids) !== 'array') {
                    __$coverCall('Plupload', '6542:6553');
                    ids = [ids];
                }
                __$coverCall('Plupload', '6562:6580');
                var i = ids.length;
                __$coverCall('Plupload', '6584:6659');
                while (i--) {
                    __$coverCall('Plupload', '6601:6619');
                    el = o.get(ids[i]);
                    __$coverCall('Plupload', '6624:6655');
                    if (el) {
                        __$coverCall('Plupload', '6638:6650');
                        els.push(el);
                    }
                }
                __$coverCall('Plupload', '6664:6694');
                return els.length ? els : null;
            },
            each: o.each,
            getPos: o.getPos,
            getSize: o.getSize,
            xmlEncode: function (str) {
                __$coverCall('Plupload', '7845:7963');
                var xmlEncodeChars = {
                        '<': 'lt',
                        '>': 'gt',
                        '&': 'amp',
                        '"': 'quot',
                        '\'': '#39'
                    }, xmlEncodeRegExp = /[<>&\"\']/g;
                __$coverCall('Plupload', '7968:8114');
                return str ? ('' + str).replace(xmlEncodeRegExp, function (chr) {
                    __$coverCall('Plupload', '8036:8102');
                    return xmlEncodeChars[chr] ? '&' + xmlEncodeChars[chr] + ';' : chr;
                }) : str;
            },
            toArray: o.toArray,
            inArray: o.inArray,
            addI18n: o.addI18n,
            translate: o.translate,
            isEmptyObj: o.isEmptyObj,
            hasClass: o.hasClass,
            addClass: o.addClass,
            removeClass: o.removeClass,
            getStyle: o.getStyle,
            addEvent: o.addEvent,
            removeEvent: o.removeEvent,
            removeAllEvents: o.removeAllEvents,
            cleanName: function (name) {
                __$coverCall('Plupload', '11763:11776');
                var i, lookup;
                __$coverCall('Plupload', '11805:12105');
                lookup = [
                    /[\300-\306]/g,
                    'A',
                    /[\340-\346]/g,
                    'a',
                    /\307/g,
                    'C',
                    /\347/g,
                    'c',
                    /[\310-\313]/g,
                    'E',
                    /[\350-\353]/g,
                    'e',
                    /[\314-\317]/g,
                    'I',
                    /[\354-\357]/g,
                    'i',
                    /\321/g,
                    'N',
                    /\361/g,
                    'n',
                    /[\322-\330]/g,
                    'O',
                    /[\362-\370]/g,
                    'o',
                    /[\331-\334]/g,
                    'U',
                    /[\371-\374]/g,
                    'u'
                ];
                __$coverCall('Plupload', '12110:12203');
                for (i = 0; i < lookup.length; i += 2) {
                    __$coverCall('Plupload', '12154:12199');
                    name = name.replace(lookup[i], lookup[i + 1]);
                }
                __$coverCall('Plupload', '12232:12264');
                name = name.replace(/\s+/g, '_');
                __$coverCall('Plupload', '12295:12339');
                name = name.replace(/[^a-z0-9_\-\.]+/gi, '');
                __$coverCall('Plupload', '12344:12355');
                return name;
            },
            buildUrl: function (url, items) {
                __$coverCall('Plupload', '12755:12769');
                var query = '';
                __$coverCall('Plupload', '12774:12916');
                plupload.each(items, function (value, name) {
                    __$coverCall('Plupload', '12822:12910');
                    query += (query ? '&' : '') + encodeURIComponent(name) + '=' + encodeURIComponent(value);
                });
                __$coverCall('Plupload', '12921:12990');
                if (query) {
                    __$coverCall('Plupload', '12937:12986');
                    url += (url.indexOf('?') > 0 ? '&' : '?') + query;
                }
                __$coverCall('Plupload', '12995:13005');
                return url;
            },
            formatSize: function (size) {
                __$coverCall('Plupload', '13270:13350');
                if (size === undef || /\D/.test(size)) {
                    __$coverCall('Plupload', '13314:13346');
                    return plupload.translate('N/A');
                }
                __$coverCall('Plupload', '13363:13473');
                if (size > 1099511627776) {
                    __$coverCall('Plupload', '13394:13469');
                    return Math.round(size / 1099511627776, 1) + ' ' + plupload.translate('tb');
                }
                __$coverCall('Plupload', '13486:13590');
                if (size > 1073741824) {
                    __$coverCall('Plupload', '13514:13586');
                    return Math.round(size / 1073741824, 1) + ' ' + plupload.translate('gb');
                }
                __$coverCall('Plupload', '13603:13701');
                if (size > 1048576) {
                    __$coverCall('Plupload', '13628:13697');
                    return Math.round(size / 1048576, 1) + ' ' + plupload.translate('mb');
                }
                __$coverCall('Plupload', '13714:13806');
                if (size > 1024) {
                    __$coverCall('Plupload', '13736:13802');
                    return Math.round(size / 1024, 1) + ' ' + plupload.translate('kb');
                }
                __$coverCall('Plupload', '13811:13854');
                return size + ' ' + plupload.translate('b');
            },
            parseSize: o.parseSizeStr,
            predictRuntime: function (config, runtimes) {
                __$coverCall('Plupload', '14547:14562');
                var up, runtime;
                __$coverCall('Plupload', '14567:14601');
                up = new plupload.Uploader(config);
                __$coverCall('Plupload', '14605:14695');
                runtime = o.Runtime.thatCan(up.getOption().required_features, runtimes || config.runtimes);
                __$coverCall('Plupload', '14699:14711');
                up.destroy();
                __$coverCall('Plupload', '14715:14729');
                return runtime;
            },
            addFileFilter: function (name, cb) {
                __$coverCall('Plupload', '15333:15355');
                fileFilters[name] = cb;
            }
        };
    __$coverCall('Plupload', '15365:15676');
    plupload.addFileFilter('mime_types', function (filters, file, cb) {
        __$coverCall('Plupload', '15433:15672');
        if (filters.length && !filters.regexp.test(file.name)) {
            __$coverCall('Plupload', '15492:15634');
            this.trigger('Error', {
                code: plupload.FILE_EXTENSION_ERROR,
                message: plupload.translate('File extension error.'),
                file: file
            });
            __$coverCall('Plupload', '15638:15647');
            cb(false);
        } else {
            __$coverCall('Plupload', '15661:15669');
            cb(true);
        }
    });
    __$coverCall('Plupload', '15680:16023');
    plupload.addFileFilter('max_file_size', function (maxSize, file, cb) {
        __$coverCall('Plupload', '15751:15760');
        var undef;
        __$coverCall('Plupload', '15786:16019');
        if (file.size !== undef && maxSize && file.size > maxSize) {
            __$coverCall('Plupload', '15849:15981');
            this.trigger('Error', {
                code: plupload.FILE_SIZE_ERROR,
                message: plupload.translate('File size error.'),
                file: file
            });
            __$coverCall('Plupload', '15985:15994');
            cb(false);
        } else {
            __$coverCall('Plupload', '16008:16016');
            cb(true);
        }
    });
    __$coverCall('Plupload', '16027:16543');
    plupload.addFileFilter('prevent_duplicates', function (value, file, cb) {
        __$coverCall('Plupload', '16101:16528');
        if (value) {
            __$coverCall('Plupload', '16116:16142');
            var ii = this.files.length;
            __$coverCall('Plupload', '16146:16525');
            while (ii--) {
                __$coverCall('Plupload', '16257:16521');
                if (file.name === this.files[ii].name && file.size === this.files[ii].size) {
                    __$coverCall('Plupload', '16339:16489');
                    this.trigger('Error', {
                        code: plupload.FILE_DUPLICATE_ERROR,
                        message: plupload.translate('Duplicate file error.'),
                        file: file
                    });
                    __$coverCall('Plupload', '16495:16504');
                    cb(false);
                    __$coverCall('Plupload', '16510:16516');
                    return;
                }
            }
        }
        __$coverCall('Plupload', '16531:16539');
        cb(true);
    });
    __$coverCall('Plupload', '19852:52532');
    plupload.Uploader = function (options) {
        __$coverCall('Plupload', '24030:24191');
        var uid = plupload.guid(), settings, files = [], preferred_caps = {}, fileInputs = [], fileDrops = [], startTime, total, disabled = false, xhr;
        __$coverCall('Plupload', '24192:24192');
        ;
        __$coverCall('Plupload', '24217:24867');
        function uploadNext() {
            __$coverCall('Plupload', '24243:24265');
            var file, count = 0, i;
            __$coverCall('Plupload', '24270:24864');
            if (this.state == plupload.STARTED) {
                __$coverCall('Plupload', '24340:24624');
                for (i = 0; i < files.length; i++) {
                    __$coverCall('Plupload', '24381:24619');
                    if (!file && files[i].status == plupload.QUEUED) {
                        __$coverCall('Plupload', '24437:24452');
                        file = files[i];
                        __$coverCall('Plupload', '24459:24586');
                        if (this.trigger('BeforeUpload', file)) {
                            __$coverCall('Plupload', '24507:24539');
                            file.status = plupload.UPLOADING;
                            __$coverCall('Plupload', '24547:24579');
                            this.trigger('UploadFile', file);
                        }
                    } else {
                        __$coverCall('Plupload', '24606:24613');
                        count++;
                    }
                }
                __$coverCall('Plupload', '24665:24860');
                if (count == files.length) {
                    __$coverCall('Plupload', '24698:24812');
                    if (this.state !== plupload.STOPPED) {
                        __$coverCall('Plupload', '24742:24771');
                        this.state = plupload.STOPPED;
                        __$coverCall('Plupload', '24778:24806');
                        this.trigger('StateChanged');
                    }
                    __$coverCall('Plupload', '24818:24855');
                    this.trigger('UploadComplete', files);
                }
            }
        }
        __$coverCall('Plupload', '24872:24990');
        function calcFile(file) {
            __$coverCall('Plupload', '24900:24977');
            file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
            __$coverCall('Plupload', '24981:24987');
            calc();
        }
        __$coverCall('Plupload', '24995:26106');
        function calc() {
            __$coverCall('Plupload', '25015:25026');
            var i, file;
            __$coverCall('Plupload', '25048:25061');
            total.reset();
            __$coverCall('Plupload', '25115:25698');
            for (i = 0; i < files.length; i++) {
                __$coverCall('Plupload', '25155:25170');
                file = files[i];
                __$coverCall('Plupload', '25176:25527');
                if (file.size !== undef) {
                    __$coverCall('Plupload', '25262:25289');
                    total.size += file.origSize;
                    __$coverCall('Plupload', '25431:25486');
                    total.loaded += file.loaded * file.origSize / file.size;
                } else {
                    __$coverCall('Plupload', '25504:25522');
                    total.size = undef;
                }
                __$coverCall('Plupload', '25533:25694');
                if (file.status == plupload.DONE) {
                    __$coverCall('Plupload', '25573:25589');
                    total.uploaded++;
                } else if (file.status == plupload.FAILED) {
                    __$coverCall('Plupload', '25643:25657');
                    total.failed++;
                } else {
                    __$coverCall('Plupload', '25675:25689');
                    total.queued++;
                }
            }
            __$coverCall('Plupload', '25796:26103');
            if (total.size === undef) {
                __$coverCall('Plupload', '25827:25912');
                total.percent = files.length > 0 ? Math.ceil(total.uploaded / files.length * 100) : 0;
            } else {
                __$coverCall('Plupload', '25928:26015');
                total.bytesPerSec = Math.ceil(total.loaded / ((+new Date() - startTime || 1) / 1000));
                __$coverCall('Plupload', '26020:26099');
                total.percent = total.size > 0 ? Math.ceil(total.loaded / total.size * 100) : 0;
            }
        }
        __$coverCall('Plupload', '26111:26244');
        function getRUID() {
            __$coverCall('Plupload', '26134:26174');
            var ctrl = fileInputs[0] || fileDrops[0];
            __$coverCall('Plupload', '26178:26225');
            if (ctrl) {
                __$coverCall('Plupload', '26193:26221');
                return ctrl.getRuntime().uid;
            }
            __$coverCall('Plupload', '26229:26241');
            return false;
        }
        __$coverCall('Plupload', '26249:26412');
        function runtimeCan(file, cap) {
            __$coverCall('Plupload', '26284:26393');
            if (file.ruid) {
                __$coverCall('Plupload', '26304:26343');
                var info = o.Runtime.getInfo(file.ruid);
                __$coverCall('Plupload', '26348:26389');
                if (info) {
                    __$coverCall('Plupload', '26364:26384');
                    return info.can(cap);
                }
            }
            __$coverCall('Plupload', '26397:26409');
            return false;
        }
        __$coverCall('Plupload', '26417:26873');
        function bindEventListeners() {
            __$coverCall('Plupload', '26451:26488');
            this.bind('FilesAdded', onFilesAdded);
            __$coverCall('Plupload', '26493:26534');
            this.bind('CancelUpload', onCancelUpload);
            __$coverCall('Plupload', '26541:26582');
            this.bind('BeforeUpload', onBeforeUpload);
            __$coverCall('Plupload', '26587:26624');
            this.bind('UploadFile', onUploadFile);
            __$coverCall('Plupload', '26629:26674');
            this.bind('UploadProgress', onUploadProgress);
            __$coverCall('Plupload', '26679:26720');
            this.bind('StateChanged', onStateChanged);
            __$coverCall('Plupload', '26725:26756');
            this.bind('QueueChanged', calc);
            __$coverCall('Plupload', '26761:26788');
            this.bind('Error', onError);
            __$coverCall('Plupload', '26793:26834');
            this.bind('FileUploaded', onFileUploaded);
            __$coverCall('Plupload', '26839:26870');
            this.bind('Destroy', onDestroy);
        }
        __$coverCall('Plupload', '26878:29846');
        function initControls(settings, cb) {
            __$coverCall('Plupload', '26918:26957');
            var self = this, inited = 0, queue = [];
            __$coverCall('Plupload', '26983:27237');
            var options = {
                    accept: settings.filters.mime_types,
                    runtime_order: settings.runtimes,
                    required_caps: settings.required_features,
                    preferred_caps: preferred_caps,
                    swf_url: settings.flash_swf_url,
                    xap_url: settings.silverlight_xap_url
                };
            __$coverCall('Plupload', '27283:27432');
            plupload.each(settings.runtimes.split(/\s*,\s*/), function (runtime) {
                __$coverCall('Plupload', '27356:27426');
                if (settings[runtime]) {
                    __$coverCall('Plupload', '27385:27421');
                    options[runtime] = settings[runtime];
                }
            });
            __$coverCall('Plupload', '27486:29048');
            if (settings.browse_button) {
                __$coverCall('Plupload', '27519:29044');
                plupload.each(settings.browse_button, function (el) {
                    __$coverCall('Plupload', '27576:29037');
                    queue.push(function (cb) {
                        __$coverCall('Plupload', '27607:27818');
                        var fileInput = new o.FileInput(plupload.extend({}, options, {
                                name: settings.file_data_name,
                                multiple: settings.multi_selection,
                                container: settings.container,
                                browse_button: el
                            }));
                        __$coverCall('Plupload', '27826:28186');
                        fileInput.onready = function () {
                            __$coverCall('Plupload', '27865:27904');
                            var info = o.Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '27949:28120');
                            o.extend(self.features, {
                                chunks: info.can('slice_blob'),
                                multipart: info.can('send_multipart'),
                                multi_selection: info.can('select_multiple')
                            });
                            __$coverCall('Plupload', '28129:28137');
                            inited++;
                            __$coverCall('Plupload', '28145:28166');
                            fileInputs.push(this);
                            __$coverCall('Plupload', '28174:28178');
                            cb();
                        };
                        __$coverCall('Plupload', '28194:28266');
                        fileInput.onchange = function () {
                            __$coverCall('Plupload', '28234:28258');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '28274:28904');
                        fileInput.bind('mouseenter mouseleave mousedown mouseup', function (e) {
                            __$coverCall('Plupload', '28352:28895');
                            if (!disabled) {
                                __$coverCall('Plupload', '28376:28627');
                                if (settings.browse_button_hover) {
                                    __$coverCall('Plupload', '28420:28618');
                                    if ('mouseenter' === e.type) {
                                        __$coverCall('Plupload', '28460:28504');
                                        o.addClass(el, settings.browse_button_hover);
                                    } else if ('mouseleave' === e.type) {
                                        __$coverCall('Plupload', '28561:28608');
                                        o.removeClass(el, settings.browse_button_hover);
                                    }
                                }
                                __$coverCall('Plupload', '28637:28887');
                                if (settings.browse_button_active) {
                                    __$coverCall('Plupload', '28682:28878');
                                    if ('mousedown' === e.type) {
                                        __$coverCall('Plupload', '28721:28766');
                                        o.addClass(el, settings.browse_button_active);
                                    } else if ('mouseup' === e.type) {
                                        __$coverCall('Plupload', '28820:28868');
                                        o.removeClass(el, settings.browse_button_active);
                                    }
                                }
                            }
                        });
                        __$coverCall('Plupload', '28912:29005');
                        fileInput.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '28968:28984');
                            fileInput = null;
                            __$coverCall('Plupload', '28992:28996');
                            cb();
                        });
                        __$coverCall('Plupload', '29013:29029');
                        fileInput.init();
                    });
                });
            }
            __$coverCall('Plupload', '29080:29745');
            if (settings.drop_element) {
                __$coverCall('Plupload', '29112:29741');
                plupload.each(settings.drop_element, function (el) {
                    __$coverCall('Plupload', '29168:29734');
                    queue.push(function (cb) {
                        __$coverCall('Plupload', '29199:29288');
                        var fileDrop = new o.FileDrop(plupload.extend({}, options, { drop_zone: el }));
                        __$coverCall('Plupload', '29296:29527');
                        fileDrop.onready = function () {
                            __$coverCall('Plupload', '29334:29373');
                            var info = o.Runtime.getInfo(this.ruid);
                            __$coverCall('Plupload', '29382:29432');
                            self.features.dragdrop = info.can('drag_and_drop');
                            __$coverCall('Plupload', '29471:29479');
                            inited++;
                            __$coverCall('Plupload', '29487:29507');
                            fileDrops.push(this);
                            __$coverCall('Plupload', '29515:29519');
                            cb();
                        };
                        __$coverCall('Plupload', '29535:29604');
                        fileDrop.ondrop = function () {
                            __$coverCall('Plupload', '29572:29596');
                            self.addFile(this.files);
                        };
                        __$coverCall('Plupload', '29612:29703');
                        fileDrop.bind('error runtimeerror', function () {
                            __$coverCall('Plupload', '29667:29682');
                            fileDrop = null;
                            __$coverCall('Plupload', '29690:29694');
                            cb();
                        });
                        __$coverCall('Plupload', '29711:29726');
                        fileDrop.init();
                    });
                });
            }
            __$coverCall('Plupload', '29751:29843');
            o.inSeries(queue, function () {
                __$coverCall('Plupload', '29785:29837');
                if (typeof cb === 'function') {
                    __$coverCall('Plupload', '29822:29832');
                    cb(inited);
                }
            });
        }
        __$coverCall('Plupload', '29851:30262');
        function resizeImage(blob, params, cb) {
            __$coverCall('Plupload', '29894:29917');
            var img = new o.Image();
            __$coverCall('Plupload', '29922:30259');
            try {
                __$coverCall('Plupload', '29931:30046');
                img.onload = function () {
                    __$coverCall('Plupload', '29961:30040');
                    img.downsize(params.width, params.height, params.crop, params.preserve_headers);
                };
                __$coverCall('Plupload', '30052:30155');
                img.onresize = function () {
                    __$coverCall('Plupload', '30084:30129');
                    cb(this.getAsBlob(blob.type, params.quality));
                    __$coverCall('Plupload', '30135:30149');
                    this.destroy();
                };
                __$coverCall('Plupload', '30161:30206');
                img.onerror = function () {
                    __$coverCall('Plupload', '30192:30200');
                    cb(blob);
                };
                __$coverCall('Plupload', '30212:30226');
                img.load(blob);
            } catch (ex) {
                __$coverCall('Plupload', '30247:30255');
                cb(blob);
            }
        }
        __$coverCall('Plupload', '30267:33454');
        function setOption(option, value, init) {
            __$coverCall('Plupload', '30311:30350');
            var self = this, reinitRequired = false;
            __$coverCall('Plupload', '30355:32494');
            function _setOption(option, value, init) {
                __$coverCall('Plupload', '30401:30432');
                var oldValue = settings[option];
                __$coverCall('Plupload', '30438:32408');
                switch (option) {
                case 'max_file_size':
                case 'chunk_size':
                    __$coverCall('Plupload', '30510:30708');
                    if (value = plupload.parseSize(value)) {
                        __$coverCall('Plupload', '30557:30581');
                        settings[option] = value;
                        __$coverCall('Plupload', '30589:30701');
                        if (option === 'max_file_size') {
                            __$coverCall('Plupload', '30630:30693');
                            settings.max_file_size = settings.filters.max_file_size = value;
                        }
                    }
                    __$coverCall('Plupload', '30715:30720');
                    break;
                case 'filters':
                    __$coverCall('Plupload', '30791:30888');
                    if (plupload.typeOf(value) === 'array') {
                        __$coverCall('Plupload', '30839:30881');
                        value = { mime_types: value };
                    }
                    __$coverCall('Plupload', '30896:31007');
                    if (init) {
                        __$coverCall('Plupload', '30914:30954');
                        plupload.extend(settings.filters, value);
                    } else {
                        __$coverCall('Plupload', '30976:31000');
                        settings.filters = value;
                    }
                    __$coverCall('Plupload', '31101:31725');
                    if (value.mime_types) {
                        __$coverCall('Plupload', '31131:31718');
                        settings.filters.mime_types.regexp = function (filters) {
                            __$coverCall('Plupload', '31196:31221');
                            var extensionsRegExp = [];
                            __$coverCall('Plupload', '31231:31606');
                            plupload.each(filters, function (filter) {
                                __$coverCall('Plupload', '31281:31595');
                                plupload.each(filter.extensions.split(/,/), function (ext) {
                                    __$coverCall('Plupload', '31350:31583');
                                    if (/^\s*\*\s*$/.test(ext)) {
                                        __$coverCall('Plupload', '31390:31419');
                                        extensionsRegExp.push('\\.*');
                                    } else {
                                        __$coverCall('Plupload', '31449:31572');
                                        extensionsRegExp.push('\\.' + ext.replace(new RegExp('[' + '/^$.*+?|()[]{}\\'.replace(/./g, '\\$&') + ']', 'g'), '\\$&'));
                                    }
                                });
                            });
                            __$coverCall('Plupload', '31616:31679');
                            return new RegExp('(' + extensionsRegExp.join('|') + ')$', 'i');
                        }(settings.filters.mime_types);
                    }
                    __$coverCall('Plupload', '31732:31737');
                    break;
                case 'resize':
                    __$coverCall('Plupload', '31765:31906');
                    if (init) {
                        __$coverCall('Plupload', '31783:31854');
                        plupload.extend(settings.resize, value, { enabled: true });
                    } else {
                        __$coverCall('Plupload', '31876:31899');
                        settings.resize = value;
                    }
                    __$coverCall('Plupload', '31913:31918');
                    break;
                case 'prevent_duplicates':
                    __$coverCall('Plupload', '31957:32032');
                    settings.prevent_duplicates = settings.filters.prevent_duplicates = !!value;
                    __$coverCall('Plupload', '32039:32044');
                    break;
                case 'browse_button':
                case 'drop_element':
                    __$coverCall('Plupload', '32104:32131');
                    value = plupload.get(value);
                case 'container':
                case 'runtimes':
                case 'multi_selection':
                case 'flash_swf_url':
                case 'silverlight_xap_url':
                    __$coverCall('Plupload', '32268:32292');
                    settings[option] = value;
                    __$coverCall('Plupload', '32299:32346');
                    if (!init) {
                        __$coverCall('Plupload', '32318:32339');
                        reinitRequired = true;
                    }
                    __$coverCall('Plupload', '32353:32358');
                    break;
                default:
                    __$coverCall('Plupload', '32379:32403');
                    settings[option] = value;
                }
                __$coverCall('Plupload', '32414:32490');
                if (!init) {
                    __$coverCall('Plupload', '32431:32485');
                    self.trigger('OptionChanged', option, value, oldValue);
                }
            }
            __$coverCall('Plupload', '32499:32678');
            if (typeof option === 'object') {
                __$coverCall('Plupload', '32537:32627');
                plupload.each(option, function (value, option) {
                    __$coverCall('Plupload', '32589:32620');
                    _setOption(option, value, init);
                });
            } else {
                __$coverCall('Plupload', '32643:32674');
                _setOption(option, value, init);
            }
            __$coverCall('Plupload', '32683:33451');
            if (init) {
                __$coverCall('Plupload', '32748:32821');
                settings.required_features = normalizeCaps(plupload.extend({}, settings));
                __$coverCall('Plupload', '32925:33022');
                preferred_caps = normalizeCaps(plupload.extend({}, settings, { required_features: true }));
            } else if (reinitRequired) {
                __$coverCall('Plupload', '33058:33081');
                self.trigger('Destroy');
                __$coverCall('Plupload', '33090:33447');
                initControls.call(self, settings, function (inited) {
                    __$coverCall('Plupload', '33147:33440');
                    if (inited) {
                        __$coverCall('Plupload', '33166:33214');
                        self.runtime = o.Runtime.getInfo(getRUID()).type;
                        __$coverCall('Plupload', '33221:33268');
                        self.trigger('Init', { runtime: self.runtime });
                        __$coverCall('Plupload', '33275:33299');
                        self.trigger('PostInit');
                    } else {
                        __$coverCall('Plupload', '33319:33434');
                        self.trigger('Error', {
                            code: plupload.INIT_ERROR,
                            message: plupload.translate('Init error.')
                        });
                    }
                });
            }
        }
        __$coverCall('Plupload', '33487:33645');
        function onFilesAdded(up, filteredFiles) {
            __$coverCall('Plupload', '33560:33595');
            [].push.apply(files, filteredFiles);
            __$coverCall('Plupload', '33600:33626');
            up.trigger('QueueChanged');
            __$coverCall('Plupload', '33630:33642');
            up.refresh();
        }
        __$coverCall('Plupload', '33650:33910');
        function onBeforeUpload(up, file) {
            __$coverCall('Plupload', '33726:33907');
            if (settings.unique_names) {
                __$coverCall('Plupload', '33758:33815');
                var matches = file.name.match(/\.([^.]+)$/), ext = 'part';
                __$coverCall('Plupload', '33820:33860');
                if (matches) {
                    __$coverCall('Plupload', '33839:33855');
                    ext = matches[1];
                }
                __$coverCall('Plupload', '33865:33903');
                file.target_name = file.id + '.' + ext;
            }
        }
        __$coverCall('Plupload', '33915:39613');
        function onUploadFile(up, file) {
            __$coverCall('Plupload', '33951:34106');
            var url = up.settings.url, chunkSize = up.settings.chunk_size, retries = up.settings.max_retries, features = up.features, offset = 0, blob;
            __$coverCall('Plupload', '34107:34107');
            ;
            __$coverCall('Plupload', '34160:34256');
            if (file.loaded) {
                __$coverCall('Plupload', '34182:34252');
                offset = file.loaded = chunkSize * Math.floor(file.loaded / chunkSize);
            }
            __$coverCall('Plupload', '34261:34657');
            function handleError() {
                __$coverCall('Plupload', '34289:34653');
                if (retries-- > 0) {
                    __$coverCall('Plupload', '34314:34342');
                    delay(uploadNextChunk, 1000);
                } else {
                    __$coverCall('Plupload', '34360:34380');
                    file.loaded = offset;
                    __$coverCall('Plupload', '34409:34648');
                    up.trigger('Error', {
                        code: plupload.HTTP_ERROR,
                        message: plupload.translate('HTTP Error.'),
                        file: file,
                        response: xhr.responseText,
                        status: xhr.status,
                        responseHeaders: xhr.getAllResponseHeaders()
                    });
                }
            }
            __$coverCall('Plupload', '34662:39193');
            function uploadNextChunk() {
                __$coverCall('Plupload', '34694:34737');
                var chunkBlob, formData, args, curChunkSize;
                __$coverCall('Plupload', '34770:34887');
                if (file.status == plupload.DONE || file.status == plupload.FAILED || up.state == plupload.STOPPED) {
                    __$coverCall('Plupload', '34876:34882');
                    return;
                }
                __$coverCall('Plupload', '34918:34963');
                args = { name: file.target_name || file.name };
                __$coverCall('Plupload', '34969:35275');
                if (chunkSize && features.chunks && blob.size > chunkSize) {
                    __$coverCall('Plupload', '35093:35147');
                    curChunkSize = Math.min(chunkSize, blob.size - offset);
                    __$coverCall('Plupload', '35153:35206');
                    chunkBlob = blob.slice(offset, offset + curChunkSize);
                } else {
                    __$coverCall('Plupload', '35224:35248');
                    curChunkSize = blob.size;
                    __$coverCall('Plupload', '35254:35270');
                    chunkBlob = blob;
                }
                __$coverCall('Plupload', '35384:35737');
                if (chunkSize && features.chunks) {
                    __$coverCall('Plupload', '35460:35732');
                    if (up.settings.send_chunk_number) {
                        __$coverCall('Plupload', '35502:35544');
                        args.chunk = Math.ceil(offset / chunkSize);
                        __$coverCall('Plupload', '35551:35597');
                        args.chunks = Math.ceil(blob.size / chunkSize);
                    } else {
                        __$coverCall('Plupload', '35677:35697');
                        args.offset = offset;
                        __$coverCall('Plupload', '35704:35726');
                        args.total = blob.size;
                    }
                }
                __$coverCall('Plupload', '35743:35771');
                xhr = new o.XMLHttpRequest();
                __$coverCall('Plupload', '35818:35988');
                if (xhr.upload) {
                    __$coverCall('Plupload', '35840:35983');
                    xhr.upload.onprogress = function (e) {
                        __$coverCall('Plupload', '35883:35935');
                        file.loaded = Math.min(file.size, offset + e.loaded);
                        __$coverCall('Plupload', '35942:35976');
                        up.trigger('UploadProgress', file);
                    };
                }
                __$coverCall('Plupload', '35994:37532');
                xhr.onload = function () {
                    __$coverCall('Plupload', '36067:36129');
                    if (xhr.status >= 400) {
                        __$coverCall('Plupload', '36097:36110');
                        handleError();
                        __$coverCall('Plupload', '36117:36123');
                        return;
                    }
                    __$coverCall('Plupload', '36136:36169');
                    retries = up.settings.max_retries;
                    __$coverCall('Plupload', '36226:36898');
                    if (curChunkSize < blob.size) {
                        __$coverCall('Plupload', '36263:36282');
                        chunkBlob.destroy();
                        __$coverCall('Plupload', '36290:36312');
                        offset += curChunkSize;
                        __$coverCall('Plupload', '36319:36360');
                        file.loaded = Math.min(offset, blob.size);
                        __$coverCall('Plupload', '36368:36577');
                        up.trigger('ChunkUploaded', file, {
                            offset: file.loaded,
                            total: blob.size,
                            response: xhr.responseText,
                            status: xhr.status,
                            responseHeaders: xhr.getAllResponseHeaders()
                        });
                        __$coverCall('Plupload', '36690:36848');
                        if (o.Env.browser === 'Android Browser') {
                            __$coverCall('Plupload', '36807:36841');
                            up.trigger('UploadProgress', file);
                        }
                    } else {
                        __$coverCall('Plupload', '36869:36892');
                        file.loaded = file.size;
                    }
                    __$coverCall('Plupload', '36905:36932');
                    chunkBlob = formData = null;
                    __$coverCall('Plupload', '36987:37526');
                    if (!offset || offset >= blob.size) {
                        __$coverCall('Plupload', '37077:37157');
                        if (file.size != file.origSize) {
                            __$coverCall('Plupload', '37117:37131');
                            blob.destroy();
                            __$coverCall('Plupload', '37139:37150');
                            blob = null;
                        }
                        __$coverCall('Plupload', '37165:37199');
                        up.trigger('UploadProgress', file);
                        __$coverCall('Plupload', '37207:37234');
                        file.status = plupload.DONE;
                        __$coverCall('Plupload', '37242:37397');
                        up.trigger('FileUploaded', file, {
                            response: xhr.responseText,
                            status: xhr.status,
                            responseHeaders: xhr.getAllResponseHeaders()
                        });
                    } else {
                        __$coverCall('Plupload', '37443:37468');
                        delay(uploadNextChunk, 1);
                    }
                };
                __$coverCall('Plupload', '37538:37588');
                xhr.onerror = function () {
                    __$coverCall('Plupload', '37569:37582');
                    handleError();
                };
                __$coverCall('Plupload', '37594:37663');
                xhr.onloadend = function () {
                    __$coverCall('Plupload', '37627:37641');
                    this.destroy();
                    __$coverCall('Plupload', '37647:37657');
                    xhr = null;
                };
                __$coverCall('Plupload', '37699:39189');
                if (up.settings.multipart && features.multipart) {
                    __$coverCall('Plupload', '37755:37796');
                    args.name = file.target_name || file.name;
                    __$coverCall('Plupload', '37803:37830');
                    xhr.open('post', url, true);
                    __$coverCall('Plupload', '37863:37968');
                    plupload.each(up.settings.headers, function (value, name) {
                        __$coverCall('Plupload', '37927:37960');
                        xhr.setRequestHeader(name, value);
                    });
                    __$coverCall('Plupload', '37975:38002');
                    formData = new o.FormData();
                    __$coverCall('Plupload', '38037:38169');
                    plupload.each(plupload.extend(args, up.settings.multipart_params), function (value, name) {
                        __$coverCall('Plupload', '38133:38161');
                        formData.append(name, value);
                    });
                    __$coverCall('Plupload', '38204:38258');
                    formData.append(up.settings.file_data_name, chunkBlob);
                    __$coverCall('Plupload', '38264:38508');
                    xhr.send(formData, {
                        runtime_order: up.settings.runtimes,
                        required_caps: up.settings.required_features,
                        preferred_caps: preferred_caps,
                        swf_url: up.settings.flash_swf_url,
                        xap_url: up.settings.silverlight_xap_url
                    });
                } else {
                    __$coverCall('Plupload', '38572:38665');
                    url = plupload.buildUrl(up.settings.url, plupload.extend(args, up.settings.multipart_params));
                    __$coverCall('Plupload', '38672:38699');
                    xhr.open('post', url, true);
                    __$coverCall('Plupload', '38706:38770');
                    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
                    __$coverCall('Plupload', '38827:38932');
                    plupload.each(up.settings.headers, function (value, name) {
                        __$coverCall('Plupload', '38891:38924');
                        xhr.setRequestHeader(name, value);
                    });
                    __$coverCall('Plupload', '38939:39184');
                    xhr.send(chunkBlob, {
                        runtime_order: up.settings.runtimes,
                        required_caps: up.settings.required_features,
                        preferred_caps: preferred_caps,
                        swf_url: up.settings.flash_swf_url,
                        xap_url: up.settings.silverlight_xap_url
                    });
                }
            }
            __$coverCall('Plupload', '39198:39221');
            blob = file.getSource();
            __$coverCall('Plupload', '39254:39610');
            if (up.settings.resize.enabled && runtimeCan(blob, 'send_binary_string') && !!~o.inArray(blob.type, [
                    'image/jpeg',
                    'image/png'
                ])) {
                __$coverCall('Plupload', '39414:39573');
                resizeImage.call(this, blob, up.settings.resize, function (resizedBlob) {
                    __$coverCall('Plupload', '39491:39509');
                    blob = resizedBlob;
                    __$coverCall('Plupload', '39515:39543');
                    file.size = resizedBlob.size;
                    __$coverCall('Plupload', '39549:39566');
                    uploadNextChunk();
                });
            } else {
                __$coverCall('Plupload', '39589:39606');
                uploadNextChunk();
            }
        }
        __$coverCall('Plupload', '39618:39675');
        function onUploadProgress(up, file) {
            __$coverCall('Plupload', '39658:39672');
            calcFile(file);
        }
        __$coverCall('Plupload', '39680:40075');
        function onStateChanged(up) {
            __$coverCall('Plupload', '39712:40072');
            if (up.state == plupload.STARTED) {
                __$coverCall('Plupload', '39789:39814');
                startTime = +new Date();
            } else if (up.state == plupload.STOPPED) {
                __$coverCall('Plupload', '39902:40068');
                for (var i = up.files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '39955:40063');
                    if (up.files[i].status == plupload.UPLOADING) {
                        __$coverCall('Plupload', '40008:40044');
                        up.files[i].status = plupload.QUEUED;
                        __$coverCall('Plupload', '40051:40057');
                        calc();
                    }
                }
            }
        }
        __$coverCall('Plupload', '40080:40142');
        function onCancelUpload() {
            __$coverCall('Plupload', '40110:40139');
            if (xhr) {
                __$coverCall('Plupload', '40124:40135');
                xhr.abort();
            }
        }
        __$coverCall('Plupload', '40147:40363');
        function onFileUploaded(up) {
            __$coverCall('Plupload', '40179:40185');
            calc();
            __$coverCall('Plupload', '40310:40360');
            delay(function () {
                __$coverCall('Plupload', '40332:40351');
                uploadNext.call(up);
            }, 1);
        }
        __$coverCall('Plupload', '40368:40814');
        function onError(up, err) {
            __$coverCall('Plupload', '40451:40811');
            if (err.file) {
                __$coverCall('Plupload', '40470:40503');
                err.file.status = plupload.FAILED;
                __$coverCall('Plupload', '40508:40526');
                calcFile(err.file);
                __$coverCall('Plupload', '40654:40807');
                if (up.state == plupload.STARTED) {
                    __$coverCall('Plupload', '40716:40742');
                    up.trigger('CancelUpload');
                    __$coverCall('Plupload', '40748:40802');
                    delay(function () {
                        __$coverCall('Plupload', '40772:40791');
                        uploadNext.call(up);
                    }, 1);
                }
            }
        }
        __$coverCall('Plupload', '40819:41322');
        function onDestroy(up) {
            __$coverCall('Plupload', '40846:40855');
            up.stop();
            __$coverCall('Plupload', '40881:40942');
            plupload.each(files, function (file) {
                __$coverCall('Plupload', '40922:40936');
                file.destroy();
            });
            __$coverCall('Plupload', '40946:40956');
            files = [];
            __$coverCall('Plupload', '40961:41091');
            if (fileInputs.length) {
                __$coverCall('Plupload', '40989:41067');
                plupload.each(fileInputs, function (fileInput) {
                    __$coverCall('Plupload', '41041:41060');
                    fileInput.destroy();
                });
                __$coverCall('Plupload', '41072:41087');
                fileInputs = [];
            }
            __$coverCall('Plupload', '41096:41221');
            if (fileDrops.length) {
                __$coverCall('Plupload', '41123:41198');
                plupload.each(fileDrops, function (fileDrop) {
                    __$coverCall('Plupload', '41173:41191');
                    fileDrop.destroy();
                });
                __$coverCall('Plupload', '41203:41217');
                fileDrops = [];
            }
            __$coverCall('Plupload', '41226:41245');
            preferred_caps = {};
            __$coverCall('Plupload', '41249:41265');
            disabled = false;
            __$coverCall('Plupload', '41269:41302');
            settings = startTime = xhr = null;
            __$coverCall('Plupload', '41306:41319');
            total.reset();
        }
        __$coverCall('Plupload', '41348:41831');
        settings = {
            runtimes: o.Runtime.order,
            max_retries: 0,
            chunk_size: 0,
            multipart: true,
            multi_selection: true,
            file_data_name: 'file',
            flash_swf_url: 'js/Moxie.swf',
            silverlight_xap_url: 'js/Moxie.xap',
            filters: {
                mime_types: [],
                prevent_duplicates: false,
                max_file_size: 0
            },
            resize: {
                enabled: false,
                preserve_headers: true,
                crop: false
            },
            send_chunk_number: true
        };
        __$coverCall('Plupload', '41837:41878');
        setOption.call(this, options, null, true);
        __$coverCall('Plupload', '41905:41941');
        total = new plupload.QueueProgress();
        __$coverCall('Plupload', '41969:52529');
        plupload.extend(this, {
            id: uid,
            uid: uid,
            state: plupload.STOPPED,
            features: {},
            runtime: null,
            files: files,
            settings: settings,
            total: total,
            init: function () {
                __$coverCall('Plupload', '43523:43538');
                var self = this;
                __$coverCall('Plupload', '43544:43728');
                if (typeof settings.preinit == 'function') {
                    __$coverCall('Plupload', '43594:43616');
                    settings.preinit(self);
                } else {
                    __$coverCall('Plupload', '43634:43723');
                    plupload.each(settings.preinit, function (func, name) {
                        __$coverCall('Plupload', '43694:43715');
                        self.bind(name, func);
                    });
                }
                __$coverCall('Plupload', '43767:43948');
                if (!settings.browse_button || !settings.url) {
                    __$coverCall('Plupload', '43819:43931');
                    this.trigger('Error', {
                        code: plupload.INIT_ERROR,
                        message: plupload.translate('Init error.')
                    });
                    __$coverCall('Plupload', '43937:43943');
                    return;
                }
                __$coverCall('Plupload', '43954:43983');
                bindEventListeners.call(this);
                __$coverCall('Plupload', '43989:44534');
                initControls.call(this, settings, function (inited) {
                    __$coverCall('Plupload', '44046:44227');
                    if (typeof settings.init == 'function') {
                        __$coverCall('Plupload', '44094:44113');
                        settings.init(self);
                    } else {
                        __$coverCall('Plupload', '44133:44221');
                        plupload.each(settings.init, function (func, name) {
                            __$coverCall('Plupload', '44191:44212');
                            self.bind(name, func);
                        });
                    }
                    __$coverCall('Plupload', '44234:44527');
                    if (inited) {
                        __$coverCall('Plupload', '44253:44301');
                        self.runtime = o.Runtime.getInfo(getRUID()).type;
                        __$coverCall('Plupload', '44308:44355');
                        self.trigger('Init', { runtime: self.runtime });
                        __$coverCall('Plupload', '44362:44386');
                        self.trigger('PostInit');
                    } else {
                        __$coverCall('Plupload', '44406:44521');
                        self.trigger('Error', {
                            code: plupload.INIT_ERROR,
                            message: plupload.translate('Init error.')
                        });
                    }
                });
            },
            setOption: function (option, value) {
                __$coverCall('Plupload', '44873:44923');
                setOption.call(this, option, value, !this.runtime);
            },
            getOption: function (option) {
                __$coverCall('Plupload', '45284:45323');
                if (!option) {
                    __$coverCall('Plupload', '45303:45318');
                    return settings;
                }
                __$coverCall('Plupload', '45328:45351');
                return settings[option];
            },
            refresh: function () {
                __$coverCall('Plupload', '45588:45711');
                if (fileInputs.length) {
                    __$coverCall('Plupload', '45617:45706');
                    plupload.each(fileInputs, function (fileInput) {
                        __$coverCall('Plupload', '45670:45698');
                        fileInput.trigger('Refresh');
                    });
                }
                __$coverCall('Plupload', '45716:45739');
                this.trigger('Refresh');
            },
            start: function () {
                __$coverCall('Plupload', '45849:45987');
                if (this.state != plupload.STARTED) {
                    __$coverCall('Plupload', '45891:45920');
                    this.state = plupload.STARTED;
                    __$coverCall('Plupload', '45926:45954');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '45961:45982');
                    uploadNext.call(this);
                }
            },
            stop: function () {
                __$coverCall('Plupload', '46098:46242');
                if (this.state != plupload.STOPPED) {
                    __$coverCall('Plupload', '46140:46169');
                    this.state = plupload.STOPPED;
                    __$coverCall('Plupload', '46175:46203');
                    this.trigger('StateChanged');
                    __$coverCall('Plupload', '46209:46237');
                    this.trigger('CancelUpload');
                }
            },
            disableBrowse: function () {
                __$coverCall('Plupload', '46452:46507');
                disabled = arguments[0] !== undef ? arguments[0] : true;
                __$coverCall('Plupload', '46513:46635');
                if (fileInputs.length) {
                    __$coverCall('Plupload', '46542:46630');
                    plupload.each(fileInputs, function (fileInput) {
                        __$coverCall('Plupload', '46595:46622');
                        fileInput.disable(disabled);
                    });
                }
                __$coverCall('Plupload', '46641:46680');
                this.trigger('DisableBrowse', disabled);
            },
            getFile: function (id) {
                __$coverCall('Plupload', '46921:46926');
                var i;
                __$coverCall('Plupload', '46931:47034');
                for (i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '46977:47029');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '47008:47023');
                        return files[i];
                    }
                }
            },
            addFile: function (file, fileName) {
                __$coverCall('Plupload', '47573:47634');
                var self = this, queue = [], files = [], ruid;
                __$coverCall('Plupload', '47635:47635');
                ;
                __$coverCall('Plupload', '47641:47960');
                function filterFile(file, cb) {
                    __$coverCall('Plupload', '47677:47691');
                    var queue = [];
                    __$coverCall('Plupload', '47697:47928');
                    o.each(self.settings.filters, function (rule, name) {
                        __$coverCall('Plupload', '47755:47920');
                        if (fileFilters[name]) {
                            __$coverCall('Plupload', '47786:47913');
                            queue.push(function (cb) {
                                __$coverCall('Plupload', '47819:47903');
                                fileFilters[name].call(self, rule, file, function (res) {
                                    __$coverCall('Plupload', '47884:47892');
                                    cb(!res);
                                });
                            });
                        }
                    });
                    __$coverCall('Plupload', '47934:47955');
                    o.inSeries(queue, cb);
                }
                __$coverCall('Plupload', '48098:49599');
                function resolveFile(file) {
                    __$coverCall('Plupload', '48131:48156');
                    var type = o.typeOf(file);
                    __$coverCall('Plupload', '48177:49594');
                    if (file instanceof o.File) {
                        __$coverCall('Plupload', '48213:48377');
                        if (!file.ruid && !file.isDetached()) {
                            __$coverCall('Plupload', '48259:48313');
                            if (!ruid) {
                                __$coverCall('Plupload', '48293:48305');
                                return false;
                            }
                            __$coverCall('Plupload', '48321:48337');
                            file.ruid = ruid;
                            __$coverCall('Plupload', '48345:48370');
                            file.connectRuntime(ruid);
                        }
                        __$coverCall('Plupload', '48384:48420');
                        resolveFile(new plupload.File(file));
                    } else if (file instanceof o.Blob) {
                        __$coverCall('Plupload', '48487:48516');
                        resolveFile(file.getSource());
                        __$coverCall('Plupload', '48523:48537');
                        file.destroy();
                    } else if (file instanceof plupload.File) {
                        __$coverCall('Plupload', '48650:48699');
                        if (fileName) {
                            __$coverCall('Plupload', '48672:48692');
                            file.name = fileName;
                        }
                        __$coverCall('Plupload', '48712:49048');
                        queue.push(function (cb) {
                            __$coverCall('Plupload', '48811:49039');
                            filterFile(file, function (err) {
                                __$coverCall('Plupload', '48851:48940');
                                if (!err) {
                                    __$coverCall('Plupload', '48871:48887');
                                    files.push(file);
                                    __$coverCall('Plupload', '48897:48931');
                                    self.trigger('FileFiltered', file);
                                }
                                __$coverCall('Plupload', '48949:48961');
                                delay(cb, 1);
                            });
                        });
                    } else if (o.inArray(type, [
                            'file',
                            'blob'
                        ]) !== -1) {
                        __$coverCall('Plupload', '49146:49181');
                        resolveFile(new o.File(null, file));
                    } else if (type === 'node' && o.typeOf(file.files) === 'filelist') {
                        __$coverCall('Plupload', '49342:49373');
                        o.each(file.files, resolveFile);
                    } else if (type === 'array') {
                        __$coverCall('Plupload', '49474:49489');
                        fileName = null;
                        __$coverCall('Plupload', '49563:49588');
                        o.each(file, resolveFile);
                    }
                }
                __$coverCall('Plupload', '49605:49621');
                ruid = getRUID();
                __$coverCall('Plupload', '49630:49647');
                resolveFile(file);
                __$coverCall('Plupload', '49653:49855');
                if (queue.length) {
                    __$coverCall('Plupload', '49677:49850');
                    o.inSeries(queue, function () {
                        __$coverCall('Plupload', '49776:49842');
                        if (files.length) {
                            __$coverCall('Plupload', '49802:49835');
                            self.trigger('FilesAdded', files);
                        }
                    });
                }
            },
            removeFile: function (file) {
                __$coverCall('Plupload', '50036:50087');
                var id = typeof file === 'string' ? file : file.id;
                __$coverCall('Plupload', '50093:50212');
                for (var i = files.length - 1; i >= 0; i--) {
                    __$coverCall('Plupload', '50143:50207');
                    if (files[i].id === id) {
                        __$coverCall('Plupload', '50174:50201');
                        return this.splice(i, 1)[0];
                    }
                }
            },
            splice: function (start, length) {
                __$coverCall('Plupload', '50641:50738');
                var removed = files.splice(start === undef ? 0 : start, length === undef ? files.length : length);
                __$coverCall('Plupload', '50744:50781');
                this.trigger('FilesRemoved', removed);
                __$coverCall('Plupload', '50840:50905');
                plupload.each(removed, function (file) {
                    __$coverCall('Plupload', '50884:50898');
                    file.destroy();
                });
                __$coverCall('Plupload', '50911:50939');
                this.trigger('QueueChanged');
                __$coverCall('Plupload', '50944:50958');
                this.refresh();
                __$coverCall('Plupload', '50964:50978');
                return removed;
            },
            bind: function (name, func, scope) {
                __$coverCall('Plupload', '51725:51740');
                var self = this;
                __$coverCall('Plupload', '51798:52028');
                plupload.Uploader.prototype.bind.call(this, name, function () {
                    __$coverCall('Plupload', '51865:51900');
                    var args = [].slice.call(arguments);
                    __$coverCall('Plupload', '51906:51929');
                    args.splice(0, 1, self);
                    __$coverCall('Plupload', '51982:52011');
                    return func.apply(this, args);
                }, 0, scope);
            },
            destroy: function () {
                __$coverCall('Plupload', '52429:52452');
                this.trigger('Destroy');
                __$coverCall('Plupload', '52457:52469');
                total = null;
                __$coverCall('Plupload', '52504:52520');
                this.unbindAll();
            }
        });
    };
    __$coverCall('Plupload', '52535:52587');
    plupload.Uploader.prototype = o.EventTarget.instance;
    __$coverCall('Plupload', '52816:55227');
    plupload.File = function () {
        __$coverCall('Plupload', '52847:52864');
        var filepool = {};
        __$coverCall('Plupload', '52868:55198');
        function PluploadFile(file) {
            __$coverCall('Plupload', '52901:55166');
            plupload.extend(this, {
                id: plupload.guid(),
                name: file.name || file.fileName,
                type: file.type || '',
                size: file.size || file.fileSize,
                origSize: file.size || file.fileSize,
                loaded: 0,
                percent: 0,
                status: plupload.QUEUED,
                lastModifiedDate: file.lastModifiedDate || new Date().toLocaleString(),
                getNative: function () {
                    __$coverCall('Plupload', '54543:54582');
                    var file = this.getSource().getSource();
                    __$coverCall('Plupload', '54588:54659');
                    return o.inArray(o.typeOf(file), [
                        'blob',
                        'file'
                    ]) !== -1 ? file : null;
                },
                getSource: function () {
                    __$coverCall('Plupload', '54862:54910');
                    if (!filepool[this.id]) {
                        __$coverCall('Plupload', '54893:54904');
                        return null;
                    }
                    __$coverCall('Plupload', '54916:54940');
                    return filepool[this.id];
                },
                destroy: function () {
                    __$coverCall('Plupload', '55057:55083');
                    var src = this.getSource();
                    __$coverCall('Plupload', '55089:55155');
                    if (src) {
                        __$coverCall('Plupload', '55105:55118');
                        src.destroy();
                        __$coverCall('Plupload', '55125:55149');
                        delete filepool[this.id];
                    }
                }
            });
            __$coverCall('Plupload', '55171:55195');
            filepool[this.id] = file;
        }
        __$coverCall('Plupload', '55202:55221');
        return PluploadFile;
    }();
    __$coverCall('Plupload', '55315:56400');
    plupload.QueueProgress = function () {
        __$coverCall('Plupload', '55354:55369');
        var self = this;
        __$coverCall('Plupload', '55515:55528');
        self.size = 0;
        __$coverCall('Plupload', '55610:55625');
        self.loaded = 0;
        __$coverCall('Plupload', '55713:55730');
        self.uploaded = 0;
        __$coverCall('Plupload', '55824:55839');
        self.failed = 0;
        __$coverCall('Plupload', '55935:55950');
        self.queued = 0;
        __$coverCall('Plupload', '56048:56064');
        self.percent = 0;
        __$coverCall('Plupload', '56156:56176');
        self.bytesPerSec = 0;
        __$coverCall('Plupload', '56260:56397');
        self.reset = function () {
            __$coverCall('Plupload', '56288:56393');
            self.size = self.loaded = self.uploaded = self.failed = self.queued = self.percent = self.bytesPerSec = 0;
        };
    };
    __$coverCall('Plupload', '56403:56429');
    window.plupload = plupload;
}(window, mOxie));