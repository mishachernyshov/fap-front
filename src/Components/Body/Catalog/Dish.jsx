import React, {useEffect, useState} from "react";

import Chip from "@material-ui/core/Chip";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import {useTranslation} from "react-i18next";

const getIngredientTableStyles = makeStyles({
    table: {
        minWidth: 400,
    },
});

const getReportStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
}));

const Dish = (props) => {
    const [dishRelatedData, setDishRelatedData] = useState({});
    const [dishId, setDishId] = useState(window.location.pathname.split('/').pop());
    const [dishReports, setDishReports] = useState([]);
    const [dishIngredients, setDishIngredients] = useState([]);
    const [firstLoading, setFirstLoading] = useState(0);
    const [sendReportButtonIsDisabled, setSendReportButtonDisabling] = useState(true);
    const dishStyles = getIngredientTableStyles();
    const reportStyles = getReportStyles();
    const { t } = useTranslation();

    const getDishInfo = () => {
        const requestApi = process.env.REACT_APP_API_URL +
            process.env.REACT_APP_DISHES + dishId + '/';
        const headers = props.requestManager.getAuthHeader();

        props.requestManager.makeGetRequest(requestApi, headers, {})
            .then(response => setDishRelatedData(response.data));
    }

    const getDishReports = () => {
        const requestApi = process.env.REACT_APP_API_URL +
            process.env.REACT_APP_ALL_DISH_REPORTS + dishId + '/';
        const headers = props.requestManager.getAuthHeader();

        props.requestManager.makeGetRequest(requestApi, headers, {})
            .then(response => setDishReports(response.data));
    }

    const getDishIngredients = () => {
        const requestApi = process.env.REACT_APP_API_URL +
            process.env.REACT_APP_DISH_INGREDIENTS_PRECISE_DATA + dishId + '/';

        props.requestManager.makeGetRequest(requestApi, {}, {})
            .then(response => setDishIngredients(response.data));
    }

    const sendReport = () => {
        const newReportField =
            document.getElementById('new-report-text');

        const requestApi = process.env.REACT_APP_API_URL +
            process.env.REACT_APP_NEW_REPORT;
        const headers = props.requestManager.getAuthHeader();
        const requestData = {
            'dish': dishId,
            'text': newReportField.value
        };
        props.requestManager.makePostRequest(requestApi, headers, requestData)
            .then(newReportField.value = '')
            .then(setSendReportButtonDisabling(true));
        setTimeout(getDishReports, 100);
    }

    useEffect(() => {
        if (!firstLoading) {
            getDishInfo();
            getDishReports();
            getDishIngredients();
        }
        setFirstLoading(1);
    })

    return (
        <div align='left' className='page-content'>
            <div id='dish-info-wrapper'>
                <div id='dish-main-info'>
                    <div id='dish-main-info-header'>
                        <div className='title'>
                            {dishRelatedData.name}
                        </div>
                        {
                            dishRelatedData.popularity &&
                            <Chip
                                label={dishRelatedData.popularity} color='primary' />
                        }
                    </div>
                    <div className='subtitle'>
                        {dishRelatedData.type}
                    </div>
                    <div>
                        <img src={dishRelatedData.image} />
                    </div>
                    <div id='ingredients-section'>
                        <div className='section-title'>
                            {t("dish.ingredients")}
                        </div>
                        <TableContainer component={Paper}>
                            <Table className={dishStyles.table} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("dish.ingredient")}</TableCell>
                                        <TableCell align="right">{t("dish.measures")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        dishIngredients.map(ingredient =>
                                            <TableRow key={ingredient.name}>
                                                <TableCell>{ingredient.name}</TableCell>
                                                <TableCell align="right">
                                                    {
                                                        localStorage.getItem('fap-language') === 'ua'
                                                        ? ingredient.weight_or_volume
                                                        : (ingredient.weight_or_volume /
                                                            (ingredient.is_liquid ? 0.028 : 453.59)).toFixed(3)
                                                    } {ingredient.is_liquid ? t("dish.volume") : t("dish.weight")}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                    <div id='dish-reports'>
                        <div className='section-title'>
                            {t("dish.reports")}
                        </div>
                        <div className={reportStyles.root}>
                            <TableContainer component={Paper} id='dish-report-container'>
                                <Table className={dishStyles.table} size="small" aria-label="a dense table">
                                    <TableBody>
                                        {
                                            dishReports.map(report =>
                                                <TableRow key={report.id}>
                                                    <TableCell>
                                                        <div className='report-header'>
                                                            <div>
                                                                {report.user}
                                                            </div>
                                                            <div>
                                                                {
                                                                    t("date_format",
                                                                        { date:
                                                                                new Date (report.publication_date.slice(0, 4),
                                                                                    report.publication_date.slice(5, 7) - 1,
                                                                                    report.publication_date.slice(8, 10))
                                                                        })
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {report.text}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        <div id='report-send'>
                            <div>
                                <TextField
                                    id="new-report-text"
                                    label={t("dish.write_report")}
                                    multiline
                                    rowsMax={7}
                                    variant="filled"
                                    onChange={event =>
                                        setSendReportButtonDisabling(
                                            event.target.value.length == 0)}
                                />
                            </div>
                            <div>
                                <Button variant="contained" color="primary" id='send_report-button'
                                    onClick={sendReport} disabled={sendReportButtonIsDisabled}>
                                    {t("dish.send_report")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id='dish-additional-info'>
                    <div className='section-title'>
                        {t("dish.description")}
                    </div>
                    <div>
                        {dishRelatedData.description}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dish;