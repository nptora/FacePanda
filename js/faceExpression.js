const MODEL_URI = "./module/weights";
const intervalTime = 250;
let myvideo;
let terminus = 0;
let beforeExpression = ["NG","NG","NG","NG"]

window.addEventListener("DOMContentLoaded", () => {
    myvideo = document.getElementById("camera");
    //モデルの学習
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URI),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URI),
    ]).then(() => {
        console.log("load modules");
        //ウェブカメラにアクセス
        navigator.mediaDevices.getUserMedia({ video:true })
        .then(stream => {
            myvideo.srcObject = stream;
            myvideo.play();
        }).catch((err) => {
            console.log(err);
        })
    });

    let faceExpressionResult;
    let resultsData = new Array();
    let fResult;

    setInterval(async () => {
        //ウェブカメラの映像から顔データを取得
        const detections = await faceapi.detectSingleFace(
            myvideo,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        //顔データが取れているときの処理
        if(detections != null){
            faceExpressionResult = analysisExpression(detections.expressions);
            resultsData.push(faceExpressionResult);
        }
        //顔データが取れていないときの処理
        else {
            console.log("model is not found");
        }
        //蓄積したデータの中から最も多い表情を出力
        terminus += intervalTime;

        let getExpression, outExpression = "NG";
        getExpression = sendData(resultsData);
        if(getExpression == undefined){
            getExpression = "NG";
            beforeExpression.forEach((before) => {
                if(before != "NG"){
                    outExpression = before;
                }
            })
        }
        else {
            outExpression = getExpression;
        }
        if(terminus >= 1000){
            fResult = outExpression;
            // fResult = sendData(resultsData);
            //ここに出力をかく
            faceChange(fResult);
            terminus = 0;
            resultsData.splice(0);
        }
        beforeExpression.unshift(getExpression);
        beforeExpression.pop();
        
        
        //表情分析のための関数
        function  analysisExpression(expressions) {
            const Array = Object.entries(expressions);
            
            //仕分け
            const sArray = Array.map((i) => i[1]);
            const eArray = Array.map((i) => i[0]);
            //一番スコアの高い表情を返す
            const sMax = Math.max.apply(null, sArray);
            const index = sArray.findIndex((score) => score === sMax);
            const faceExpressionResult = eArray[index];   
            return faceExpressionResult;
        }

        //判定結果
        function sendData(resultsData) {
            let faceResult;
            let faceCount = {
                neutral: 0,
                happy: 0,
                sad: 0,
                angry: 0,
                fearful: 0,
                disgusted: 0,
                suprised: 0
            };
            //n秒間取り続けたデータを種類別に仕分け
            for(let i=0; i<resultsData.length; i++){
                let havingdata = resultsData[i];
                faceCount[havingdata] += 1;
            }
            //一番多く出てきた表情を結果として返す
            let maxCount = 0;
            for(const property in faceCount){
                if(maxCount < faceCount[property]){
                    maxCount = faceCount[property];
                    faceResult = property;
                }
            }
            return faceResult;
        }

        function faceChange(faceExpressions) {
            switch (faceExpressions) {
                case 'neutral':
                    document.getElementById("pandaFace").src="./img/neutral.png";
                    break;
                
                case 'happy':
                    document.getElementById("pandaFace").src="./img/happy.png";
                    break;

                case 'sad':
                    document.getElementById("pandaFace").src="./img/sad.png";
                    break;
                
                case 'angry':
                    document.getElementById("pandaFace").src="./img/angry.png";
                    break;
                
                case 'fearful':
                    document.getElementById("pandaFace").src="./img/fearful.png";
                    break;

                case 'disgusted':
                    document.getElementById("pandaFace").src="./img/disgusted.png";
                    break;
                
                case 'suprised':
                    document.getElementById("pandaFace").src="./img/suprised.png";
                    break;

                case 'NG':
                    document.getElementById("pandaFace").src="./img/ng.png"
                    break;

                default:
                    break;
            }
            //document.getElementById("pandaFace").src=pics_src[faceExpressions];
        }
    }, intervalTime);
});