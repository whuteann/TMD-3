

export const CSSStyles = `
  body {
    font-family: "Times New Roman", Times, serif;

    margin: 10mm 15mm 10mm 15mm;
  }
  h1 {
    text-align: left;
    font-size: 25px;
  }
  h2 {
  text-align: left;
  font-size: 15px;
  }
  p{
  text-align: left;
  font-size: 5px;
  }
  #firstColumn{
  display:inline-block;
  margin-right:10px;
  }
  #secondColumn{
  font-size: 100px;
  display:inline-block;
  }
  #firstListColumn{
  font-size: 9px;
  display:inline-block;
  }
  #secondListColumn{
  font-size: 9px;
  display:inline-block;
  }
  #normalBodyPara {
  font-size: 15px;
  }
  .multiline {
  white-space: pre-wrap;
  }
  @page {
  margin: 20px;
  }
  .main {
    display: flex;
    flex-direction: column;
}
.main > div {
    padding: 0;
    line-height: 17px;
    font-size: 12px;
}
`