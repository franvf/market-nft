//Not working file, only for test purpose.
import React, {Component, PropTypes} from 'react';
import html2canvas from "html2canvas"
import {jsPDF} from "jspdf"
import { css } from 'styled-components'

class pdf extends Component {
  constructor(props) {
    super(props);
  }

  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 0, 0);
        pdf.output('dataurlnewwindow');
        pdf.save("ticket.pdf");
      });
  }

  render() {
    return (
      <div>
        <div className="mb5">
          <button onClick={this.printDocument}>Download PDF</button>
        </div>
        <div id="divToPrint" className="mt4" {...css({
          backgroundColor: '#f5f5f5',
          width: '210mm',
          minHeight: '297mm',
          marginLeft: 'auto',
          marginRight: 'auto'
        })}>
        <div>Note: Here the dimensions of div are same as A4</div> 
        <div>You Can add any component here</div>
      </div>
    </div>)
  }
} export default pdf