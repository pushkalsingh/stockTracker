import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-table-data',
  imports: [DatePipe, CurrencyPipe, DecimalPipe,MatInputModule],
  templateUrl: './table-data.component.html',
  styleUrl: './table-data.component.scss'
})
export class TableDataComponent implements OnChanges {
  @Input() sevenDaysData: any = [];
  @Input()dividendInfo:any =[];
  @Input()intraDay:any=[];
  arraylength!: number;
  averageVolume?: number;
  averagePrice?: number;
  rangeVariation?: number;
  totalPrices: number = 0;
  totalVolume: number = 0;
  minPrice!: number;
  maxPrice!: number;

  async ngOnChanges(changes: SimpleChanges) {
    console.log("seven data", this.sevenDaysData);
    
    
    if (changes['sevenDaysData']) {
      this.arraylength = this.sevenDaysData.length;
      console.log(this.arraylength)
      for (let i = 0; i < this.arraylength; i++) {
        this.totalVolume = this.sevenDaysData[i].volume + this.totalVolume;
        this.totalPrices = this.sevenDaysData[i].close + this.totalPrices;
        //console.log("this.totalVolume",this.totalVolume,i);

        if (i === 0) {
          this.minPrice = this.sevenDaysData[0].close;
          this.maxPrice = this.sevenDaysData[0].close;
        }
        else {
          if (this.minPrice >= this.sevenDaysData[i].close) {
            this.minPrice = this.sevenDaysData[i].close;
          }
          if (this.maxPrice <= this.sevenDaysData[i].close) {
            this.maxPrice = this.sevenDaysData[i].close;
          }
        }
      }
      this.averagePrice = this.totalPrices / this.arraylength;
      this.averageVolume = this.totalVolume / this.arraylength;
      this.rangeVariation = this.maxPrice - this.minPrice;
      // Code to execute after the view has been updated
      console.log('View updated after ngOnChanges');
      // Access and manipulate DOM elements here if needed 
    }
    if(changes['dividendInfo']){
      console.log("adidida", this.dividendInfo[0]);
    }
  }
}

