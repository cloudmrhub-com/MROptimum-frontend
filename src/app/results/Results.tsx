import React, {Fragment, useEffect, useState} from 'react';
import './Results.scss';
import CmrCollapse from '../../common/components/Cmr-components/collapse/Collapse';
import CmrPanel from '../../common/components/Cmr-components/panel/Panel';
import CmrTable from '../../common/components/CmrTable/CmrTable';
import { getUploadedData } from '../../features/data/dataActionCreation';
import { useAppDispatch, useAppSelector } from '../../features/hooks';
import { UploadedFile } from '../../features/data/dataSlice';
import IconButton from "@mui/material/IconButton";
import GetAppIcon from "@mui/icons-material/GetApp";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NiiVue, {nv} from "../../common/components/src/Niivue";
import {Job} from "../../features/jobs/jobsSlice";
import axios from "axios";
import {UNZIP} from "../../Variables";
import {getUpstreamJobs} from "../../features/jobs/jobActionCreation";

interface NiiFile {
    filename:string;
    id:number;
    dim:number;
    name:string;
    type:string;
    link:string;
}

const Results = () => {
    const [completedJobsData, setCompletedJobsData] = useState<Array<UploadedFile>>();

    const dispatch = useAppDispatch();
    const { accessToken } = useAppSelector((state) => state.authenticate);
    const results = useAppSelector((state)=>
        state.jobs.jobs);
    const [volumes, setVolumes] = useState<{url:string, name:string}[]>( []);
    const completedJobsColumns = [
        {
            headerName: 'Job ID',
            dataIndex: 'id',
            field: 'id',
            flex: 1,
        },
        {
            headerName: 'Alias',
            dataIndex: 'alias',
            field: 'alias',
            flex: 3,
        },
        {
            headerName: 'Date Submitted',
            dataIndex: 'createdAt',
            field: 'createdAt',
            flex: 2,
        },
        {
            headerName: 'Status',
            dataIndex: 'status',
            field: 'status',
            flex: 1,
        },
        {
            field: 'action',
            headerName: 'Action',
            sortable: false,
            width: 160,
            disableClickEventBubbling: true,
            renderCell: (params:{row:Job}) => {
                return (
                    <div>
                        <IconButton disabled={params.row.status!='completed'} onClick={() => {
                            let counter = 0;
                            params.row.files.forEach(file => {
                                axios.post(UNZIP, JSON.parse(file.location),{
                                    headers: {
                                        Authorization:`Bearer ${accessToken}`
                                    }
                                }).then(value => {
                                    let niis:NiiFile[] = value.data;
                                    let volumes = niis.map((value)=>{
                                        return {url:value.link, name: value.filename};
                                    });
                                    // let volumes = [{url:niis[1].link,name:niis[1].filename}]
                                    setVolumes(volumes);
                                    nv.loadVolumes([volumes[0]]);
                                }).catch((reason)=>{
                                    console.log(reason);
                                    console.log(JSON.parse(file.location));
                                });

                            });
                            setOpenPanel([1]);
                        }}>
                            <PlayArrowIcon sx={{
                                color: (params.row.status!='completed')?'#a9b7a9':'#4CAF50', // green color
                                '&:hover': {
                                    color: '#45a049', // darker green when hovering
                                },
                            }}/>
                        </IconButton>
                        <IconButton onClick={(e) => {
                            params.row.files.forEach(file => {
                                let url = file.link;
                                if(url=="unknown")
                                    return;
                                // Create an anchor element
                                const a = document.createElement('a');
                                // Extract the file name from the URL, if possible
                                a.download = `${file.fileName}.${url.split('.').pop()}`;
                                a.href = url;
                                // Append the anchor to the body (this is necessary to programmatically trigger the click event)
                                document.body.appendChild(a);

                                // Trigger a click event to start the download
                                a.click();

                                // Remove the anchor from the body
                                document.body.removeChild(a);
                            });

                        }}>
                            <GetAppIcon/>
                        </IconButton>
                    </div>
                );
            },
        }
    ];

    const [openPanel, setOpenPanel] = useState([0]);

    useEffect(() => {
        //@ts-ignore
        dispatch(getUploadedData(accessToken));
        //@ts-ignore
        dispatch(getUpstreamJobs(accessToken));
    }, []);

    return (
        <Fragment>
            <CmrCollapse accordion={false} expandIconPosition="right" activeKey={openPanel} onChange={(key: any) => {
                setOpenPanel(key)
            }}>
                <CmrPanel header='Results' className={'mb-2'} key={'0'}>
                    <CmrTable  dataSource={results} columns={completedJobsColumns}/>
                </CmrPanel>
                <CmrPanel header='Inspection' key={'1'}>
                    <NiiVue volumes={volumes}/>
                </CmrPanel>
            </CmrCollapse>
            <div style={{height:'69px'}}></div>
        </Fragment>
    );
};

export default Results;
