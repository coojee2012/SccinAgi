//additional functions for data table
$.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings) {
	return {
		"iStart": oSettings._iDisplayStart,
		"iEnd": oSettings.fnDisplayEnd(),
		"iLength": oSettings._iDisplayLength,
		"iTotal": oSettings.fnRecordsTotal(),
		"iFilteredTotal": oSettings.fnRecordsDisplay(),
		"iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
		"iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
	};
}
$.extend($.fn.dataTableExt.oPagination, {
	"bootstrap": {
		"fnInit": function(oSettings, nPaging, fnDraw) {
			var oLang = oSettings.oLanguage.oPaginate;
			var fnClickHandler = function(e) {
				e.preventDefault();
				if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
					fnDraw(oSettings);
				}
			};

			$(nPaging).addClass('pagination').append(
				'<ul>' +
				'<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' +
				'<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' +
				'</ul>'
			);
			var els = $('a', nPaging);
			$(els[0]).bind('click.DT', {
				action: "previous"
			}, fnClickHandler);
			$(els[1]).bind('click.DT', {
				action: "next"
			}, fnClickHandler);
		},

		"fnUpdate": function(oSettings, fnDraw) {
			var iListLength = 5;
			var oPaging = oSettings.oInstance.fnPagingInfo();
			var an = oSettings.aanFeatures.p;
			var i, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

			if (oPaging.iTotalPages < iListLength) {
				iStart = 1;
				iEnd = oPaging.iTotalPages;
			} else if (oPaging.iPage <= iHalf) {
				iStart = 1;
				iEnd = iListLength;
			} else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
				iStart = oPaging.iTotalPages - iListLength + 1;
				iEnd = oPaging.iTotalPages;
			} else {
				iStart = oPaging.iPage - iHalf + 1;
				iEnd = iStart + iListLength - 1;
			}

			for (i = 0, iLen = an.length; i < iLen; i++) {
				// remove the middle elements
				$('li:gt(0)', an[i]).filter(':not(:last)').remove();

				// add the new list items and their event handlers
				for (j = iStart; j <= iEnd; j++) {
					sClass = (j == oPaging.iPage + 1) ? 'class="active"' : '';
					$('<li ' + sClass + '><a href="#">' + j + '</a></li>')
						.insertBefore($('li:last', an[i])[0])
						.bind('click', function(e) {
							e.preventDefault();
							oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
							fnDraw(oSettings);
						});
				}

				// add / remove disabled classes from the static elements
				if (oPaging.iPage === 0) {
					$('li:first', an[i]).addClass('disabled');
				} else {
					$('li:first', an[i]).removeClass('disabled');
				}

				if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
					$('li:last', an[i]).addClass('disabled');
				} else {
					$('li:last', an[i]).removeClass('disabled');
				}
			}
		}
	}
});


$.fn.DataTable.TableTools.BUTTONS.download = {
	"sAction": "text",
	"sTag": "default",
	"sFieldBoundary": "",
	"sFieldSeperator": "\t",
	"sNewLine": "<br>",
	"sToolTip": "",
	"sButtonClass": "DTTT_button_text",
	"sButtonClassHover": "DTTT_button_text_hover",
	"sButtonText": "下载",
	"mColumns": "all",
	"bHeader": true,
	"bFooter": false,
	"sDiv": "",
	"fnMouseover": null,
	"fnMouseout": null,
	"fnClick": function(nButton, oConfig) {
		var oParams = this.s.dt.oApi._fnAjaxParameters(this.s.dt);
		var aoPost = oConfig.aoPost || [
			//{ "name": "hello", "value": "world" }
		];
		var aoGet = oConfig.aoGet || [];

		/* Create an IFrame to do the request */
		nIFrame = document.createElement('iframe');
		nIFrame.setAttribute('id', 'RemotingIFrame');
		nIFrame.style.border = '0px';
		nIFrame.style.width = '0px';
		nIFrame.style.height = '0px';

		document.body.appendChild(nIFrame);
		var nContentWindow = nIFrame.contentWindow;
		nContentWindow.document.open();
		nContentWindow.document.close();

		var nForm = nContentWindow.document.createElement('form');
		nForm.setAttribute('method', 'post');

		/* Add POST data */
		for (var i = 0; i < aoPost.length; i++) {
			nInput = nContentWindow.document.createElement('input');
			nInput.setAttribute('name', aoPost[i].name);
			nInput.setAttribute('type', 'text');
			nInput.value = aoPost[i].value;

			nForm.appendChild(nInput);
		}

		/* Add GET data to the URL */
		var sUrlAddition = '';
		for (var i = 0; i < aoGet.length; i++) {
			sUrlAddition += aoGet[i].name + '=' + aoGet[i].value + '&';
		}

		nForm.setAttribute('action', oConfig.sUrl);

		/* Add the form and the iframe */
		nContentWindow.document.body.appendChild(nForm);

		/* Send the request */
		nForm.submit();
	},
	"fnSelect": null,
	"fnComplete": null,
	"fnInit": null
};

$.fn.DataTable.TableTools.BUTTONS.extxls = {
	"sAction": "flash_save",
	"sCharSet": "utf16le",
	"bBomInc": true,
	"sFileName": "*.csv",
	"sFieldBoundary": "",
	"sFieldSeperator": "\t",
	"sNewLine": "auto",
	"sTitle": "",
	"sToolTip": "",
	"sButtonClass": "DTTT_button_xls",
	"sButtonClassHover": "DTTT_button_xls_hover",
	"sButtonText": "Excel",
	"sAjaxUrl": "",
	"sParameters": "",
	"sKeys": "",
	"mColumns": "all",
	"bHeader": true,
	"bFooter": true,
	"bSelectedOnly": false,
	"fnMouseover": null,
	"fnMouseout": null,
	"fnClick": function(nButton, oConfig, flash) {
		var sData = this.fnGetExtXlsData(oConfig, "header");
		var vkeys = oConfig.sKeys;
		var Parameters=oConfig.fnParameters();
		    vkeys=Parameters.sColumns.split(',');
		$.ajax({
			"url": oConfig.sAjaxUrl,
			"data": Parameters,
			"async": false,
			"success": function(data) {
				$.each(data.aaData, function(k, n) {
					// sData += (k+1) + "\t";
					for (j = 0; j < vkeys.length; j++) {
						var forobj = vkeys[j].split('.');
						if (forobj.length < 2)
							sData += " " + eval("n[\"" + vkeys[j] + "\"]") + "\t";
						else {
							sData += " " + eval("n[\"" + forobj[0] + "\"][\"" + forobj[1] + "\"]") + "\t";
						}
					}
					sData += "\r\n";
				});
			},
			"dataType": "json",
			"type": "POST"
		});
		sData += this.fnGetExtXlsData(oConfig, "footer");
		this.fnSetText(flash, sData);
	},
	"fnSelect": null,
	"fnComplete": null,
	"fnInit": null,
	"fnAjaxComplete": null
};

$.fn.DataTable.TableTools.prototype.fnGetExtXlsData=function ( oConfig , flag)
 {
  /* In future this could be used to get data from a plain HTML source as well as DataTables */
  if ( this.s.dt )
  {
   
                  
return this._fnGetExtXlsData( oConfig , flag);


  }
 };
$.fn.DataTable.TableTools.prototype._fnGetExtXlsData=function ( oConfig , flag)
 {
  var i, iLen, j, jLen;
  var sData = '', sLoopData = '';
  var dt = this.s.dt;
  var regex = new RegExp(oConfig.sFieldBoundary, "g"); /* Do it here for speed */
  var aColumnsInc = this._fnColumnTargets( oConfig.mColumns );
  var sNewline = this._fnNewline( oConfig );

  /*
   * Header
   */
  if (
                  
oConfig.bHeader && flag == "header")

  {
   for ( i=0, iLen=dt.aoColumns.length ; i<iLen ; i++ )
   {
    if ( aColumnsInc[i] )
    {
     sLoopData = dt.aoColumns[i].sTitle.replace(/\n/g," ").replace( /<.*?>/g, "" );
     sLoopData = this._fnHtmlDecode( sLoopData );

     sData += this._fnBoundData( sLoopData, oConfig.sFieldBoundary, regex ) +
       oConfig.sFieldSeperator;
    }
   }
   sData = sData.slice( 0, oConfig.sFieldSeperator.length*-1 );
   sData += sNewline;
  }

  /*
   * Footer
   */
  if (
                  
oConfig.bFooter && flag == "footer")

  {
   for ( i=0, iLen=dt.aoColumns.length ; i<iLen ; i++ )
   {
    if ( aColumnsInc[i] && dt.aoColumns[i].nTf !== null )
    {
     sLoopData = dt.aoColumns[i].nTf.innerHTML.replace(/\n/g," ").replace( /<.*?>/g, "" );
     sLoopData = this._fnHtmlDecode( sLoopData );

     sData += this._fnBoundData( sLoopData, oConfig.sFieldBoundary, regex ) +
       oConfig.sFieldSeperator;
    }
   }
   sData = sData.slice( 0, oConfig.sFieldSeperator.length*-1 );
  }

  /* No pointers here - this is a string copy
                  
*/
  //_sLastData = sData;
  return sData;
 };