import * as React from 'react';
import {connect} from 'react-redux';
import {IApplicationState} from '../store/reducers/reducer';
import { SPHttpClient } from '@microsoft/sp-http'; 
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/components/Button';
import styles from '../TrainingDeliveryProcess.module.scss';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker'; 
import {changeData,IListItem,postData,cancel,setError,setDateState,showPanel,postEditData} from '../store/actions/actions';


export interface IAddFormProps{
    spHttpClient: SPHttpClient;  
    siteUrl: string;
    context:WebPartContext;
    changeData: (data:any) => {};
    item:IListItem;
    items:IListItem[];
    listName:string;
    postData: (spHttpClient:SPHttpClient,siteUrl:string,data:any,listName:string) => {};
    postEditData: (spHttpClient:SPHttpClient,siteUrl:string,data:any,listName:string,Id:number) => {};
    onCancel: () => {};
    isFormvalid:boolean;
    isDateValid:boolean;
    isShowPanel:boolean;
    setError: () => {};
    setDateState: (data:boolean) => {};
    showPanel: (data:boolean) => {};
}

class Add extends React.Component<IAddFormProps , {}>{
 
    private onFormFieldChange = (event,inputIdentifier:string) => {
        var data={
            value: event.target.value,
            field: inputIdentifier
        }
        this.props.changeData(data);
    };

    private onSubmit = () => {
        this.props.showPanel(false);
        if(this.props.item.Id>0){
            //Edit
            const data = {
                Title:this.props.item.Title,
                TrainingDate:this.props.item.TrainingDate,
                Description:this.props.item.Description,
            }
            this.props.postEditData(this.props.spHttpClient,this.props.siteUrl,data,this.props.listName,this.props.item.Id);
        }
        else{
            //Add
            const data = {
                Title:this.props.item.Title,
                TrainingDate:this.props.item.TrainingDate,
                TrainingStatus:this.props.item.TrainingStatus,
                Description:this.props.item.Description,
            }
            this.props.postData(this.props.spHttpClient,this.props.siteUrl,data,this.props.listName);
        }
    }

    private onCancel = () => {
        this.props.onCancel();
    }

    private onDateFieldChange = (date: Date | null | undefined) => {
        var data={
            value: date,
            field: "DATE"
        } 
        this.props.changeData(data);
    };

    private checkIfDateExists = (date: Date,prvDate:Date):boolean => {
        let currentItem:IListItem[]=this.props.items.filter(i=>i.Id==this.props.item.Id);
        if(currentItem.length>0){
            //Edit item
            if(this.props.item.TrainingDate===prvDate){
                console.log(false);
                return false;
            }
            else{
                console.log('there');
                //date is changed
                let isExist:boolean = false;
                let selectedDate:string= date.toISOString().split('T')[0];
                this.props.items.forEach(element => {
                    if(selectedDate===element.TrainingDate.toString().split('T')[0] && element.Id!==this.props.item.Id){
                        isExist=true;
                    }
                });
                console.log(isExist);
                return isExist;
            }
        }
        else{
            let isExist:boolean = false;
            let selectedDate:string= date.toISOString().split('T')[0];
            this.props.items.forEach(element => {
                if(selectedDate===element.TrainingDate.toString().split('T')[0]){
                    isExist=true;
                }
            });
            return isExist;
        }
    };
    private _onFormatDate = (date: Date): string => { 
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear(); 
    }; 

    private _onSave = (prvDate:Date) => {
        const data = {
            Title:this.props.item.Title,
            TrainingDate:this.props.item.TrainingDate,
            TrainingStatus:this.props.item.TrainingStatus,
            Description:this.props.item.Description
        }
        if(data.Title!=="" && data.TrainingDate!==null && data.Description!==""){
            if(this.checkIfDateExists(data.TrainingDate,prvDate)){
                this.props.setDateState(false);
            }
            else{
                this.props.setDateState(true);
                this.props.showPanel(true);
            }
        }
        else{
            this.props.setError();
        }       
    }
    
    private _onClosePanel = () => {
        this.props.showPanel(false);
    }
    
    private _onRenderFooterContent = (): JSX.Element => {
        return (
          <div style={{display:'inline'}}>
            <PrimaryButton onClick={()=>this.onSubmit()} style={{ marginRight: '8px' }}>
              Confirm
          </PrimaryButton>
            <DefaultButton onClick={()=>this._onClosePanel()}>Cancel</DefaultButton>
          </div>
        );
      }
        public render():React.ReactElement<IAddFormProps>{
            let prvDate:Date=this.props.item.TrainingDate;
            let errorMessage:string = "";
            if(!this.props.isFormvalid){
                errorMessage="Please fill all mandatory fields."
            }
            if(!this.props.isDateValid){
                errorMessage=errorMessage + " A training exists on selected date, please select another date."
            }
        return (       
            <div className={styles.Add}>
                <div style={{backgroundColor:'#06d4d4',height:'25px'}}>
                            <div className={styles.FeedTitle}>ADD TRAINING</div>
                </div>
                <div className= "col-md-12" style={{backgroundColor:'white',border:'1px solid #e3e8e8'}}>
                <div className="col-md-12" style={{marginTop:'10px'}}>
                <div className="col-md-2">
                    <label style={{fontWeight:'bold'}}>Title <label style={{color:'red'}}>*</label></label>
                </div>
                <div className="col-md-10">
                    <input style={{width:'100%'}} type="text" onChange={(event)=>this.onFormFieldChange(event,"TITLE")} defaultValue={this.props.item.Title}></input>
                </div>
            </div>
            <div className="col-md-12" style={{marginTop:'10px'}}>
                <div className="col-md-2">
                    <label style={{fontWeight:'bold'}}>Date <label style={{color:'red'}}>*</label></label>
                </div>
                <div className="col-md-10">
                <DatePicker placeholder="Select a date..."  
                            formatDate={this._onFormatDate} 
                            minDate={new Date(2000,12,30)} 
                            isMonthPickerVisible={false} 
                            onSelectDate={this.onDateFieldChange}
                            value={this.props.item.TrainingDate}
                            defaultValue={this.props.item.TrainingDate.toString()}
                        /> 
                </div>
            </div>
            
            <div className="col-md-12" style={{marginTop:'10px'}}>
                <div className="col-md-2">
                    <label style={{fontWeight:'bold'}}>Description <label style={{color:'red'}}>*</label></label>
                </div>
                <div className="col-md-10">
                    <textarea style={{minHeight:'200px',width:'100%'}} onChange={(event)=>this.onFormFieldChange(event,"DESC")} defaultValue={this.props.item.Description}></textarea>
                </div>
            </div>
            <div className="col-md-12" style={{marginTop:'10px',marginBottom:'10px'}}>
                <div className="col-md-2">
                    <button type="button" className="btn btn-success" style={{marginLeft:'10px',marginTop:'5px'}} onClick={()=>{this._onSave(prvDate)}}>Submit</button>
                </div>
                <div className="col-md-2">
                    <button type="button" className="btn btn-danger" style={{marginLeft:'10px',marginTop:'5px'}} onClick={()=>{this.onCancel()}}>Cancel</button>
                </div>
                <div className="col-md-8">
                </div>
            </div>  
            <div className="col-md-12" style={{marginTop:'10px',marginBottom:'10px'}}>
                <div style={{color:'red'}}>{errorMessage}</div>
            </div>              
                </div>            
                <Panel isOpen={this.props.isShowPanel}
                type={PanelType.smallFixedFar}
                onDismiss={this._onClosePanel}
                isFooterAtBottom={false}
                headerText="Are you sure you want to submit this request?"
                closeButtonAriaLabel="Close"
                onRenderFooterContent={this._onRenderFooterContent}>
                <span>Please check the details filled and click on Confirm button to submit this request.</span>
                </Panel>  
            </div>
        )
    };
}

const mapStateToProps = (state:IApplicationState) => {
    return {
        item:state.item,
        isFormvalid:state.isFormvalid,
        isDateValid: state.isDateValid,
        items:state.items,
        isShowPanel:state.showPanel    
    };
}

const mapDispatchToProps = (dispatch:any) => {
    return {
       changeData: (data:any) => {dispatch(changeData(data))},
       postData: (spHttpClient:SPHttpClient,siteUrl:string,data:any,listName:string) => {dispatch(postData(spHttpClient,siteUrl,data,listName))},
       onCancel: () => {dispatch(cancel())},
       setError: () => {dispatch(setError())},
       setDateState: (data:boolean) => {dispatch(setDateState(data))},
       showPanel: (data:boolean) => {dispatch(showPanel(data))},
       postEditData:(spHttpClient:SPHttpClient,siteUrl:string,data:any,listName:string,Id:number) => {dispatch(postEditData(spHttpClient,siteUrl,data,listName,Id))},
    };
}

export default connect(mapStateToProps,mapDispatchToProps)(Add);