import { AfterViewInit, Component, OnInit, signal, ViewChild } from '@angular/core';
import axios from "axios";
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableDataComponent } from "./table-data/table-data.component";
import moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-root',
  imports: [CommonModule, 
    ReactiveFormsModule, 
    TableDataComponent, 
    FormsModule,
    MatSelect, 
    MatSelectModule, 
    MatFormFieldModule, 
    MatInputModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  @ViewChild('select') select!: MatSelect;
  showComp = false;
  options: any;
  optionStock: any;
  dividendStock: any;
  dividendOptions: any;
  intraDayOptions: any;
  intraDayVal: any;
  title = 'sTockTracker';
  accessKey: string = "d552a1dbf02bde4aef826f561a338339";
  exchange: string = "XNSE";
  currentDate = new Date();
  formattedDate = moment(this.currentDate).format('YYYY-MM-DD');
  offsetValue = 0;
  optionsSymbol: any = {
    method: 'GET',
    url: `http://api.marketstack.com/v1/exchanges/${this.exchange}/tickers?access_key=${this.accessKey}`,
    params: {
      limit: 1000,
      offset: `${this.offsetValue}`
    },
  };
  symArray: any = [];
  searchTerm: string = '';
  selectedItem: any = null;
  isDropdownVisible = false;
  loading = false; // Add loading indicator
  filteredStocks: any = [];
  selected: any;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      searchTerm: [''],
      selectedStock: [null]
    });
  }
  selectedStock = signal('');
  async ngOnInit() {
    this.symArray = await this.getSymbols(this.optionsSymbol)
    console.log(this.symArray);
    this.loading = true; //start loading
    this.filteredStocks = [...this.symArray]; // Initialize filteredStocks
    this.loading = false; //stop loading
    this.form.get('searchTerm')!.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      ).subscribe(() => {
        this.onSearchChange();
      });
       this.select.open();
       console.log("select ", this.select )
  }
  onSearchChange(): void {
    this.filterStocks(); // Call filterStocks when input changes
    this.select.open();
  }
  

  filterStocks(): void {
    const searchTerm = this.form.value.searchTerm;
    if (!searchTerm) {
      this.filteredStocks = [];
      this.isDropdownVisible = false;
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = this.symArray.filter((stock: { name: string; symbol: string; }) =>
        stock.name.toLowerCase().includes(searchTermLower) ||
        stock.symbol.toLowerCase().includes(searchTermLower)
      );
      this.filteredStocks = filtered.slice(0, 10); // Limit to 10
      this.isDropdownVisible = this.filteredStocks.length > 0;
    }
  }

  async getSymbols(optionsSymbol: any) {
    const symbols1 = await axios.request(optionsSymbol)
    const symArray1 = symbols1.data.data.tickers;
    /*this.offsetValue = 1000;
    const symbols2 = await axios.request(optionsSymbol)
    const symArray2 = symbols2.data.data.tickers;
    const symbols3 = await axios.request(optionsSymbol)
    this.offsetValue = 2000;
    const symArray3 = symbols3.data.data.tickers;*/
    const symArray = [...symArray1]
    return symArray
  }

  async submit() {
    const valFromForm = this.form.value.selectedStock
    console.log('Form Submitted:', valFromForm);

    console.log(this.formattedDate);
    const lastWeekDate = new Date(this.currentDate.getTime() - 10 * 24 * 60 * 60 * 1000);
    const formattedLastWeekDate = moment(lastWeekDate).format('YYYY-MM-DD');
    this.options = {
      method: "GET",
      url: `https://api.marketstack.com/v1/eod?access_key=${this.accessKey}`,
      params: {
        symbols: `${valFromForm}`,
        date_from: `${formattedLastWeekDate}`,
        date_to: `${this.formattedDate}`,
      },
    };
    this.dividendOptions = {
      method: 'GET',
      url: `https://api.marketstack.com/v1/dividends?access_key=${this.accessKey}`,
      params: {
        symbols: `${valFromForm}`,
      }
    };
    this.intraDayOptions = {
      method: "GET",
      url: `https://api.marketstack.com/v1/tickers/${valFromForm}/eod/latest?access_key=${this.accessKey}`
    };
    this.optionStock = await this.callToGetRespnse(this.options);
    this.dividendStock = await this.callToGetDividend(this.dividendOptions);
    this.intraDayVal = await this.callToGetIntraDay(this.intraDayOptions)
    console.log("abcd ", this.optionStock)
    console.log("abcd again", this.dividendStock)
    console.log("abcd again again", this.intraDayVal)
    this.showComp = true;
  }

  async callToGetRespnse(singleSelectedStock: any) {
    const returnData = await axios.request(singleSelectedStock)
    console.log("returnData", returnData)
    console.log("afsaasd", returnData.data.data)
    return returnData.data.data;
  }

  async callToGetDividend(urlStock: any) {
    const returnData = await axios.request(urlStock)
    console.log("returnData", returnData)
    console.log("afsaasd", returnData.data.data)
    return returnData.data.data;
  }

  async callToGetIntraDay(stockOption: any) {
    const returnData = await axios.request(stockOption)
    console.log("returnDataIntraDay", returnData)
    console.log("IntraDay", returnData.data)
    return returnData.data;
  }
  onSearchFocus(): void {
    this.isDropdownVisible = this.filteredStocks.length > 0;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.isDropdownVisible = true;
      this.select.open();
    }, 20);

  }

  trackBySymbol(index: number, item: any): string {
    return item.symbol;
  }

    ngAfterViewInit() {
    this.select.open(); // Programmatically open the select after the view has been initialized
    this.selected = this.filteredStocks[0];
    console.log("stock", this.selected);
  }
}




