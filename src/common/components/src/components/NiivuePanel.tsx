import React from "react"
import { Box } from "@mui/material"
import {nv} from "../Niivue";
import LocationTable from "./LocationTable";
import {ROITable} from "../../../../app/results/Rois";
import {DrawToolkit, DrawToolkitProps} from "./DrawToolKit";
import GUI from 'lil-gui';

interface NiivuePanelProps{
    nv:any;
    displayVertical:boolean;
    pipelineID:string;
    locationTableVisible: boolean;
    locationData:any[];
    decimalPrecision: number;
    drawToolkitProps: DrawToolkitProps;
    resampleImage:()=>void;
    layerList: React.ComponentProps<any>[];
    mins: number[];
    maxs: number[];
    mms: number[];
}

function createGUI(){
    const element = document.getElementById('controlDock');
    if (element?.firstChild) {
        element.innerHTML='';
    }
    const gui = new GUI({
        container: (document.getElementById( 'controlDock' )as HTMLElement) }) ;

    const customStyleTag = document.createElement( 'style' );
    document.head.appendChild( customStyleTag );
    customStyleTag.innerHTML=`.lil-gui {
            --background-color: #ffffff;
            --text-color: #3d3d3d;
            --title-background-color: #efefef;
            --title-text-color: #3d3d3d;
            --widget-color: #f0f0f0;
            --hover-color: #f0f0f0;
            --focus-color: #fafafa;
            --number-color: #000000;
            --string-color: #8da300;
        }
        
        .lil-gui .controller > .name{
            font-size:12pt;
        }
        .lil-gui .title {
            font-size:14pt;
        }
        `;
    const myObject = {
        xSlice: 0,
        ySlice: 1,
        zSlice: 2,
    };
    let controllerX=gui.add( myObject, 'xSlice',0,1 );   // Number Field
    let controllerY=gui.add( myObject, 'ySlice' ,0,1);   // Number Field
    let controllerZ=gui.add( myObject, 'zSlice' ,0,1);   // Number Field
    return {gui,controllerX,controllerY,controllerZ};
}
export function NiivuePanel (props:NiivuePanelProps) {
    const sliceControl = React.useRef(null);
	const canvas = React.useRef(null)
    const histogram = React.useRef(null);
    const {mins,maxs,mms} = props;
    let height = 650;
    // This hook is for initialization, called only once
    React.useEffect(()=>{
        props.nv.attachTo('niiCanvas');
        props.nv.opts.dragMode=props.nv.dragModes.pan;
    },[canvas]);

    // This hook is called when show distribution state changed
	React.useEffect(() => {
        props.nv.resizeListener();
        props.nv.setMultiplanarLayout(2);
        props.nv.setMultiplanarPadPixels(10);
        props.resampleImage();
    }, [props.displayVertical]);

    React.useEffect(() => {
        if(!props.displayVertical)
            props.resampleImage();
    }, [histogram]);

    let {gui,controllerX,controllerZ,controllerY} = createGUI();

    React.useEffect(()=>{
        document.getElementById('controlDock')?.appendChild(gui.domElement);
    },[sliceControl]);

    React.useEffect(()=>{
        controllerX.min(mins[0]).max(maxs[0]).setValue(mms[0]);
        controllerY.min(mins[1]).max(maxs[1]).setValue(mms[1]);
        controllerZ.min(mins[2]).max(maxs[2]).setValue(mms[2]);
    },[mins,maxs,props.locationData])

	return (
		<Box style={{width:'100%',display:'flex',flexDirection:'row', justifyContent:"flex-end"}}>
            <Box sx={{width:'1fr'}} style={{display:'flex',flexDirection:'column'}}>
                <Box id={"controlDock"} style={{width:'100%'}}  ref={sliceControl}/>
                <Box style={{height:'70%',paddingRight:10, marginTop:20}}>
                    {props.layerList}
                </Box>
            </Box>
            <Box
                sx={{
                    width:props.displayVertical?'100%':height,
                    height: height+1,
                    display:'flex',
                    flexDirection:'column',
                }}
            >
                <LocationTable
                    tableData={props.locationData}
                    isVisible={props.locationTableVisible}
                    decimalPrecision={props.decimalPrecision}
                    showDistribution={props.displayVertical}
                    style={{width:'100%',height:'20pt', color:'white'}}
                />
                <canvas id={'niiCanvas'} ref={canvas} height={height} width={'100%'} />
            </Box>
            <Box sx={{width: '40%',
                display:(props.displayVertical)?'none':'flex',
                height:height+1, marginLeft:1, flexDirection:'column'}}>
                <DrawToolkit {...props.drawToolkitProps}
                     style={{height:'10%'}} />
                <Box
                    ref={histogram}
                    id={'histoplot'}
                    style={{
                        width:'100%',
                        height: '44%'
                    }}
                >
                </Box>

                <ROITable
                    pipelineID={props.pipelineID}
                    style={{
                        width:'100%',
                        height:'45%'
                    }}
                />
            </Box>
        </Box>
	)
}