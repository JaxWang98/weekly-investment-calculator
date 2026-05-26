// 每周定投收益计算工具 JavaScript 代码

// 全局变量
let chart = null;
let calculationResults = [];
let currentFrequency = 'weekly';

// DOM 元素加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const investmentFrequencyInput = document.getElementById('investmentFrequency');
    const weeklyAmountInput = document.getElementById('weeklyAmount');
    const initialAmountInput = document.getElementById('initialAmount');
    const completedYearsInput = document.getElementById('completedYears');
    const historicalInvestmentInput = document.getElementById('historicalInvestment');
    const annualRateInput = document.getElementById('annualRate');
    const investmentYearsInput = document.getElementById('investmentYears');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultSection = document.getElementById('resultSection');
    const chartTabs = document.querySelectorAll('.chart-tab');

    // 添加事件监听器
    calculateBtn.addEventListener('click', calculateInvestment);
    resetBtn.addEventListener('click', resetForm);
    investmentFrequencyInput.addEventListener('change', function() {
        currentFrequency = investmentFrequencyInput.value;
        updateFrequencyLabels();
    });
    
    // 为输入框添加实时验证
    weeklyAmountInput.addEventListener('input', () => validateInput(weeklyAmountInput, validateWeeklyAmount));
    initialAmountInput.addEventListener('input', () => validateInput(initialAmountInput, validateInitialAmount));
    completedYearsInput.addEventListener('input', () => validateInput(completedYearsInput, validateCompletedYears));
    historicalInvestmentInput.addEventListener('input', () => validateInput(historicalInvestmentInput, validateHistoricalInvestment));
    annualRateInput.addEventListener('input', () => validateInput(annualRateInput, validateAnnualRate));
    investmentYearsInput.addEventListener('input', () => validateInput(investmentYearsInput, validateInvestmentYears));
    
    // 为图表标签添加点击事件
    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签的active类
            chartTabs.forEach(t => t.classList.remove('active'));
            // 为当前点击的标签添加active类
            tab.classList.add('active');
            // 更新图表
            updateChart(tab.dataset.chart);
        });
    });

    updateFrequencyLabels();
});

/**
 * 获取当前定投频率配置
 * @returns {{value: string, label: string, periodsPerYear: number, placeholder: string}}
 */
function getFrequencyConfig() {
    if (currentFrequency === 'monthly') {
        return {
            value: 'monthly',
            label: '每月定投',
            periodsPerYear: 12,
            placeholder: '例如: 1000'
        };
    }

    return {
        value: 'weekly',
        label: '每周定投',
        periodsPerYear: 52,
        placeholder: '例如: 100'
    };
}

/**
 * 根据定投频率更新文案
 */
function updateFrequencyLabels() {
    const frequencyConfig = getFrequencyConfig();

    document.getElementById('amountLabel').textContent = `${frequencyConfig.label}金额 (元)`;
    document.getElementById('weeklyAmount').placeholder = frequencyConfig.placeholder;
    document.getElementById('amountHeader').textContent = frequencyConfig.label;
    document.getElementById('amountHelpText').textContent = `${frequencyConfig.label}金额: 支持正整数或带两位小数的数值`;
    document.getElementById('logicDescription').textContent = `本工具采用复利计算方式，假设${frequencyConfig.label}金额固定，输入的年化收益率表示一次性投入时的预期年化收益水平，并据此模拟定投后的实际表现。计算公式基于以下假设：`;
    document.getElementById('amountAssumption').textContent = `${frequencyConfig.label}金额固定`;
    document.getElementById('rateAssumption').textContent = `输入的预期年化收益率会换算为等价${frequencyConfig.value === 'weekly' ? '周' : '月'}收益率后按${frequencyConfig.value === 'weekly' ? '周' : '月'}复利计算`;
}

/**
 * 验证输入函数
 * @param {HTMLInputElement} inputElement - 输入元素
 * @param {Function} validationFunction - 验证函数
 * @returns {boolean} - 验证是否通过
 */
function validateInput(inputElement, validationFunction) {
    const errorElement = document.getElementById(`${inputElement.id}Error`);
    const errorMessage = validationFunction(inputElement.value);
    
    if (errorMessage) {
        errorElement.textContent = errorMessage;
        inputElement.classList.add('error');
        return false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        return true;
    }
}

/**
 * 验证每周定投金额
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateWeeklyAmount(value) {
    const frequencyConfig = getFrequencyConfig();

    if (!value) return `请输入${frequencyConfig.label}金额`;
    
    const amount = parseFloat(value);
    if (isNaN(amount)) return '请输入有效的金额';
    if (amount <= 0) return '金额必须大于0';
    
    // 检查小数位数
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) return '金额最多支持两位小数';
    
    return '';
}

/**
 * 验证期初已有资产
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateInitialAmount(value) {
    return validateOptionalAmount(value, '期初已有资产');
}

/**
 * 验证历史累计投入
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateHistoricalInvestment(value) {
    return validateOptionalAmount(value, '历史累计投入');
}

/**
 * 验证可选金额
 * @param {string} value - 输入值
 * @param {string} fieldName - 字段名称
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateOptionalAmount(value, fieldName) {
    if (!value) return '';

    const amount = parseFloat(value);
    if (isNaN(amount)) return `请输入有效的${fieldName}`;
    if (amount < 0) return `${fieldName}不能为负数`;

    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) return `${fieldName}最多支持两位小数`;

    return '';
}

/**
 * 验证已完成定投年限
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateCompletedYears(value) {
    if (!value) return '';

    const years = parseInt(value);
    if (isNaN(years)) return '请输入有效的已完成定投年限';
    if (years < 0) return '已完成定投年限不能为负数';
    if (years > 50) return '已完成定投年限不能超过50年';
    if (value % 1 !== 0) return '已完成定投年限必须为整数';

    return '';
}

/**
 * 验证年化利率
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateAnnualRate(value) {
    if (!value) return '请输入年化利率';
    
    const rate = parseFloat(value);
    if (isNaN(rate)) return '请输入有效的利率';
    if (rate < 0) return '利率不能为负数';
    if (rate > 100) return '利率不能超过100%';
    
    // 检查小数位数
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) return '利率最多支持两位小数';
    
    return '';
}

/**
 * 验证定投年限
 * @param {string} value - 输入值
 * @returns {string} - 错误信息，如果验证通过则返回空字符串
 */
function validateInvestmentYears(value) {
    if (!value) return '请输入定投年限';
    
    const years = parseInt(value);
    if (isNaN(years)) return '请输入有效的年限';
    if (years < 1) return '年限必须大于0';
    if (years > 50) return '年限不能超过50年';
    
    // 检查是否为整数
    if (value % 1 !== 0) return '年限必须为整数';
    
    return '';
}

/**
 * 计算投资收益
 */
function calculateInvestment() {
    // 获取输入值
    currentFrequency = document.getElementById('investmentFrequency').value;
    const weeklyAmount = parseFloat(document.getElementById('weeklyAmount').value);
    const initialAmountValue = document.getElementById('initialAmount').value;
    const completedYearsValue = document.getElementById('completedYears').value;
    const historicalInvestmentValue = document.getElementById('historicalInvestment').value;
    const initialAmount = initialAmountValue ? parseFloat(initialAmountValue) : 0;
    const completedYears = completedYearsValue ? parseInt(completedYearsValue) : 0;
    const historicalInvestment = historicalInvestmentValue ? parseFloat(historicalInvestmentValue) : initialAmount;
    const annualRate = parseFloat(document.getElementById('annualRate').value) / 100;
    const investmentYears = parseInt(document.getElementById('investmentYears').value);
    const frequencyConfig = getFrequencyConfig();
    const contributionAmount = weeklyAmount;
    
    // 验证所有输入
    const isWeeklyAmountValid = validateInput(document.getElementById('weeklyAmount'), validateWeeklyAmount);
    const isInitialAmountValid = validateInput(document.getElementById('initialAmount'), validateInitialAmount);
    const isCompletedYearsValid = validateInput(document.getElementById('completedYears'), validateCompletedYears);
    const isHistoricalInvestmentValid = validateInput(document.getElementById('historicalInvestment'), validateHistoricalInvestment);
    const isAnnualRateValid = validateInput(document.getElementById('annualRate'), validateAnnualRate);
    const isInvestmentYearsValid = validateInput(document.getElementById('investmentYears'), validateInvestmentYears);
    
    // 如果有任何输入无效，则不进行计算
    if (
        !isWeeklyAmountValid ||
        !isInitialAmountValid ||
        !isCompletedYearsValid ||
        !isHistoricalInvestmentValid ||
        !isAnnualRateValid ||
        !isInvestmentYearsValid
    ) {
        return;
    }
    
    // 将输入的有效年化收益率换算为等价单期收益率
    const periodicRate = Math.pow(1 + annualRate, 1 / frequencyConfig.periodsPerYear) - 1;
    
    // 初始化结果数组
    calculationResults = [];
    // 计算每年的投资结果
    let totalAmount = initialAmount;
    let totalInvestment = historicalInvestment;
    
    for (let year = 1; year <= investmentYears; year++) {
        const displayYear = completedYears + year;
        const elapsedYears = completedYears + year;
        let yearStartAmount = totalAmount;
        let yearInvestment = 0;
        
        // 计算该年的每期投资和收益
        for (let period = 1; period <= frequencyConfig.periodsPerYear; period++) {
            // 每期投入金额
            totalAmount += contributionAmount;
            yearInvestment += contributionAmount;
            totalInvestment += contributionAmount;
            
            // 计算本期收益（基于当前总额）
            totalAmount *= (1 + periodicRate);
        }
        
        // 计算当年收益
        const yearEndAmount = totalAmount;
        const yearProfit = yearEndAmount - yearStartAmount - yearInvestment;
        const cumulativeProfit = totalAmount - totalInvestment;
        const actualAnnualizedRate = calculateActualAnnualizedRate(
            totalAmount,
            totalInvestment,
            elapsedYears
        );
        
        // 将结果添加到数组
        calculationResults.push({
            year: displayYear,
            frequencyLabel: frequencyConfig.label,
            contributionAmount: contributionAmount,
            yearStartAmount: yearStartAmount,
            yearInvestment: yearInvestment,
            annualRate: annualRate * 100,
            actualAnnualizedRate: actualAnnualizedRate,
            yearProfit: yearProfit,
            cumulativeProfit: cumulativeProfit,
            totalAmount: totalAmount,
            totalInvestment: totalInvestment
        });
    }
    
    // 显示计算结果
    displayResults();
    
    // 显示结果区域
    document.getElementById('resultSection').classList.remove('hidden');
    
    // 绘制初始图表（总资产趋势）
    updateChart('totalAssets');
}

/**
 * 显示计算结果
 */
function displayResults() {
    // 更新摘要信息
    const lastResult = calculationResults[calculationResults.length - 1];
    document.getElementById('totalInvestment').textContent = formatCurrency(lastResult.totalInvestment);
    document.getElementById('finalTotal').textContent = formatCurrency(lastResult.totalAmount);
    document.getElementById('totalProfit').textContent = formatCurrency(lastResult.cumulativeProfit);
    
    // 计算总收益率
    const totalReturnRate = lastResult.totalInvestment > 0
        ? (lastResult.cumulativeProfit / lastResult.totalInvestment) * 100
        : 0;
    document.getElementById('totalReturnRate').textContent = totalReturnRate.toFixed(2) + '%';
    document.getElementById('actualAnnualizedRate').textContent = lastResult.actualAnnualizedRate.toFixed(2) + '%';
    
    // 更新表格
    const tableBody = document.querySelector('#resultTable tbody');
    tableBody.innerHTML = '';
    
    calculationResults.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.year}</td>
            <td>${formatCurrency(result.contributionAmount)}</td>
            <td>${formatCurrency(result.yearStartAmount)}</td>
            <td>${formatCurrency(result.yearInvestment)}</td>
            <td>${result.annualRate.toFixed(2)}%</td>
            <td>${result.actualAnnualizedRate.toFixed(2)}%</td>
            <td>${formatCurrency(result.yearProfit)}</td>
            <td>${formatCurrency(result.cumulativeProfit)}</td>
            <td>${formatCurrency(result.totalAmount)}</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * 更新图表
 * @param {string} chartType - 图表类型：'totalAssets' 或 'annualReturns'
 */
function updateChart(chartType) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    
    // 如果已有图表，销毁它
    if (chart) {
        chart.destroy();
    }
    
    // 准备数据
    const years = calculationResults.map(result => result.year);
    
    if (chartType === 'totalAssets') {
        // 总资产趋势图（折线图）
        const totalAmounts = calculationResults.map(result => result.totalAmount);
        const totalInvestments = calculationResults.map(result => result.totalInvestment);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: '总资产',
                        data: totalAmounts,
                        borderColor: '#4263eb',
                        backgroundColor: 'rgba(66, 99, 235, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: '总投入',
                        data: totalInvestments,
                        borderColor: '#6c757d',
                        backgroundColor: 'rgba(108, 117, 125, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '总资产与总投入对比',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '年份'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '金额 (元)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    } else if (chartType === 'annualReturns') {
        // 年度收益对比图（柱状图）
        const yearProfits = calculationResults.map(result => result.yearProfit);
        const cumulativeProfits = calculationResults.map(result => result.cumulativeProfit);
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: '当年收益',
                        data: yearProfits,
                        backgroundColor: 'rgba(40, 167, 69, 0.7)',
                        borderColor: 'rgba(40, 167, 69, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '累计收益',
                        data: cumulativeProfits,
                        backgroundColor: 'rgba(66, 99, 235, 0.7)',
                        borderColor: 'rgba(66, 99, 235, 1)',
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '年度收益与累计收益对比',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '年份'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '当年收益 (元)'
                        },
                        position: 'left',
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    },
                    y1: {
                        title: {
                            display: true,
                            text: '累计收益 (元)'
                        },
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * 重置表单
 */
function resetForm() {
    // 重置输入框
    document.getElementById('investmentFrequency').value = 'weekly';
    document.getElementById('weeklyAmount').value = '';
    document.getElementById('initialAmount').value = '';
    document.getElementById('completedYears').value = '';
    document.getElementById('historicalInvestment').value = '';
    document.getElementById('annualRate').value = '';
    document.getElementById('investmentYears').value = '';
    currentFrequency = 'weekly';
    updateFrequencyLabels();
    
    // 清除错误信息
    document.getElementById('weeklyAmountError').textContent = '';
    document.getElementById('initialAmountError').textContent = '';
    document.getElementById('completedYearsError').textContent = '';
    document.getElementById('historicalInvestmentError').textContent = '';
    document.getElementById('annualRateError').textContent = '';
    document.getElementById('investmentYearsError').textContent = '';
    
    // 移除错误样式
    document.getElementById('weeklyAmount').classList.remove('error');
    document.getElementById('initialAmount').classList.remove('error');
    document.getElementById('completedYears').classList.remove('error');
    document.getElementById('historicalInvestment').classList.remove('error');
    document.getElementById('annualRate').classList.remove('error');
    document.getElementById('investmentYears').classList.remove('error');
    
    // 隐藏结果区域
    document.getElementById('resultSection').classList.add('hidden');
    
    // 清除图表
    if (chart) {
        chart.destroy();
        chart = null;
    }
    
    // 重置结果数组
    calculationResults = [];
}

/**
 * 格式化货币
 * @param {number} value - 金额
 * @returns {string} - 格式化后的金额字符串
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * 计算定投后的实际年化收益率
 * 这里按“如果全部投入资金在期初一次性到位”作为对比口径，
 * 衡量分批定投后相对于总投入资金的年化表现。
 * @param {number} finalValue - 期末资产
 * @param {number} totalInvestment - 累计总投入
 * @param {number} years - 投资年数
 * @returns {number} - 实际年化收益率（百分比）
 */
function calculateActualAnnualizedRate(finalValue, totalInvestment, years) {
    if (totalInvestment <= 0 || years <= 0 || finalValue <= 0) {
        return 0;
    }

    return (Math.pow(finalValue / totalInvestment, 1 / years) - 1) * 100;
}
