import nodemailer from 'nodemailer';

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pbookMfee04@gmail.com',
        pass: 'mfee04pbook'
    }
});

var mailOptions = {
    from: 'pbookMfee04@gmail.com',
    to: '',
    subject: '',
    html: ''
};

export function mailAcSignOK(result) {
    mailOptions.to = result.inputData.email
    mailOptions.subject = '【品書活動報名】' + result.title

    let html = `
    <header style='text-align:center'>
        <h1>您已報名活動：\n${result.title}</h1>
        <strong>報名資料：</strong><br/><br/>
        <span>姓名：${result.inputData.name}</span><br/>
        <span>電話：${result.inputData.phone}</span><br/>
        <span>信箱：${result.inputData.email}</span><br/>
    </header>
    <section style="margin-top: 3rem; padding: 2rem; border-top: 1px solid #ccc">
        ${result.intro.replace(/<img.*>/g, '')}
    </section>`;

    mailOptions.html = html

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export function mailAcSignNotice(result){
    if(typeof(result)==='string') result = JSON.parse(result)

    mailOptions.to = result.inputData.email
    mailOptions.subject = '【品書活動提醒】' + result.title

    let html = `
    <header style='text-align:center'>
        <h1>提醒您，您報名的活動即將開始：\n${result.title}</h1>
        <strong>報名資料：</strong><br/><br/>
        <span>姓名：${result.inputData.name}</span><br/>
        <span>電話：${result.inputData.phone}</span><br/>
        <span>信箱：${result.inputData.email}</span><br/>
    </header>
    <section style="margin-top: 3rem; padding: 2rem; border-top: 1px solid #ccc">
        ${result.intro.replace(/<img.*>/g, '')}
    </section>`;

    mailOptions.html = html

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
