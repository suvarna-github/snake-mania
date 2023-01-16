import React, { useState, useEffect } from 'react';
import { requestJira } from '@forge/bridge';
import Snake from "./Snake";
import Food from "./Food";
//import Button from "./Button";
import Menu from "./Menu";
import ForgeUI, { AdminPage, render, useProductContext } from '@forge/ui';
import api, { route } from "@forge/api";

const getCustomfields = async() => {
  const response = await requestJira(`/rest/api/3/field`);

  console.log(`Response: ${response.status} ${response.statusText}`);
  
  const data = await response.json();
  //console.log("len in custom field: " + data.length);
  //console.log(data);
  return data;
};

const getRandomFood = () => {
  let min = 1;
  let max = 98;
  let x = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
  let y = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
  return [x, y];
};

function App() {

    const context = useProductContext();
    //const [allFields] = useState(async() => await getCustomfields());
    const [allFields, setAllFields] = useState([]);
    const [direction, setDirection] = useState("RIGHT");
    const [speed, setSpeed] = useState(100);
    const [route, setRoute] = useState("menu");
    const [foodOver, setFoodOver] = useState(false);
    const [snakeDots, setSnakeDots] = useState([[0, 0], [0, 2]]);
    const [foods, setFoods] = useState(getRandomFood());

    useEffect(async() => {
      setInterval(moveSnake, speed);
      document.onkeydown = onKeyDown;
      console.log("t");
      //getCustomFields().then(setAllFields);
    }, [])
    
    /*componentDidMount() {
      setInterval(this.moveSnake, this.state.speed);
      document.onkeydown = this.onKeyDown;
      console.log("t");
      this.getCustomfields();
      this.getDuplicateFields();
    }
  
    componentDidUpdate() {
      this.onSnakeOutOfBounds();
      this.onSnakeCollapsed();
      this.onSnakeEats();
      this.onFoodOver();
    }*/

    useEffect(() => {
      onSnakeOutOfBounds();
    }, [snakeDots])

    const onSnakeOutOfBounds = () => {
      let head = snakeDots[snakeDots.length - 1];
      if (route === "game") {
        if (head[0] >= 100 || head[1] >= 100 || head[0] < 0 || head[1] < 0) {
          gameOver();
        }
      }
    }
  
    useEffect(() => {
      onSnakeCollapsed();
    }, [snakeDots])

    const onSnakeCollapsed = () => {
      let snake = [...snakeDots];
      let head = snake[snake.length - 1];
      snake.pop();
      snake.forEach(dot => {
        if (head[0] == dot[0] && head[1] == dot[1]) {
          gameOver();
        }
      });
    }

    useEffect(() => {
      onFoodOver();
    }, [snakeDots])

    const onFoodOver = () => {
        if(snakeDots.length == 5){ 
            foodOver = true;
            gameOver();
        }
    }

    useEffect(() => {
      onSnakeEats();
      //setInterval(moveSnake, speed);
    }, [snakeDots])
  
    const onSnakeEats = () => {
      let head = snakeDots[snakeDots.length - 1];
      let food = foods;
      if (head[0] == food[0] && head[1] == food[1]) {
        setFoods(getRandomFood());
        increaseSnake();
        //this.increaseSpeed();
      }
    }
    
    console.log('Test')
    
    console.log("fields: " + allFields)

    const customFields = allFields.filter(field => { 
      return field.custom === true; 
    }).map((field) => ({
      name:  field.name,
      id: field.schema.customId,
      type: field.schema.custom
    }));
      
    console.log("number of custom fields: " + customFields.length);
    //console.log(customFields);
    
    const duplicateCFs = [];
    for(let i = 0; i < customFields.length; i++){
      for(let j = 0; j < customFields.length; j++){
        if(i != j){
          let cf1 = customFields[i];
          let cf2 = customFields[j];
          if(cf1.name.toUpperCase() == cf2.name.toUpperCase()){          
            duplicateCFs.push(customFields[i]);
            break;
          }
        }
      }
    }


    console.log("number of duplicate custom fields: " + duplicateCFs.length);
    //console.log(duplicateCFs);

    const groupArr = [];
    let groupId;
      for(let i =0; i < duplicateCFs.length; i++)
      {
        let group = duplicateCFs[i].name.toUpperCase();
        let found = 0;
        //console.log("group:" + group);
          for(let j = 0; j < groupArr.length ; j++)
          {
              //console.log("for j " + j + ":" + groupCF[j])
            if(groupArr[j] === group) {
                //console.log("in if")
              found = 1;
              break;
            }
          }
        //console.log(groupId);
        if(found == 0) {groupArr.push(group);}
      }
    //console.log(groupArr);
    const groupObj = groupArr.map(function(key){ return {fieldname: key}})
    //console.log(groupObj)

    const grouped = [];
    for(let k = 0; k < groupObj.length; k++)
    {
        fieldname =groupObj[k].fieldname;
        grouped[k] = duplicateCFs.filter(field => {return field.name.toUpperCase() === fieldname})
        //console.log(JSON.stringify(grouped[k]))
        newstr = {
            fieldname: groupObj[k].fieldname,
            duplicates: grouped[k]
        }
        groupObj.splice(k, 1, newstr)
        //console.log(groupObj[k])
    }
    //console.log(groupObj)

    for(let m = 0 ; m < groupObj.length; m++){
        //console.log("Duplicates for " + groupObj[m].fieldname + " are as below: ")
        //console.log("no. of duplicates: " + groupObj[m].duplicates.length)
        for(let n = 0; n < groupObj[m].duplicates.length; n++){
            console.log(n+1 + ": customfield_" + groupObj[m].duplicates[n].id + " type: " + groupObj[m].duplicates[n].type)
        }
    }

    useEffect(() => {
      onKeyDown();
      //setInterval(moveSnake, speed);
    }, [window.event])

    
    const onKeyDown = e => {
      e = e || window.event;
      switch (e.keyCode) {
        case 37:
          setDirection("LEFT");
          break;
        case 38:
          setDirection("UP");
          break;
        case 39:
          setDirection("RIGHT");
          break;
        case 40:
          setDirection("DOWN");
          break;
      }
    };
  
    const moveSnake = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];
      if (route === "game") {
        switch (direction) {
          case "RIGHT":
            head = [head[0] + 2, head[1]];
            break;
          case "LEFT":
            head = [head[0] - 2, head[1]];
            break;
          case "DOWN":
            head = [head[0], head[1] + 2];
            break;
          case "UP":
            head = [head[0], head[1] - 2];
            break;
        }
        dots.push(head);
        dots.shift();
        setSnakeDots(dots);
      }
    };
  
    
  
    const increaseSnake = () => {
      let newSnake = [...snakeDots];
      newSnake.unshift([]);
      setSnakeDots(newSnake);
    }
  
    const increaseSpeed = () => {
      if (speed > 10) {
        setSpeed(speed - 20);
      }
    }
  
    const onRouteChange = () => {
      console.log("in route change");
      setRoute("game");
      //console.log("duplicate count : " + dFields.length);
    };
  
    const gameOver = () => {
        if(foodOver == true){
            alert(`GAME OVER, no food left`);
        }
        else{
            alert(`GAME OVER, your score is ${snakeDots.length - 2}`);
            console.log("duplicate fields count: " + duplicateCFs.length);
        }
      resetGame();
    }

    const resetGame = () => {
      setFoods(getRandomFood());
      setDirection("RIGHT");
      setSpeed(100);
      setRoute("menu");
      setFoodOver(false);
      setSnakeDots([[0, 0], [0, 2]]);
    }
  
    const onDown = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];
  
      head = [head[0], head[1] + 2];
      dots.push(head);
      dots.shift();
      setDirection("DOWN");
      setSnakeDots(dots);
    };
  
    const onUp = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];
  
      head = [head[0], head[1] - 2];
      dots.push(head);
      dots.shift();
      setDirection("UP");
      setSnakeDots(dots);
    };
  
    const onRight = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];
  
      head = [head[0] + 2, head[1]];
      dots.push(head);
      dots.shift();
      setDirection("RIGHT");
      setSnakeDots(dots);
    };
  
    const onLeft = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];
  
      head = [head[0] - 2, head[1]];
      dots.push(head);
      dots.shift();
      setDirection("LEFT");
      setSnakeDots(dots);
    };


        
        //const { route, snakeDots, food } = this.state;
        return (            
              <div>
              {route === "menu" ? (
                <div>
                  <Menu onRouteChange={onRouteChange} />
                </div>
              ) : (
                <div>
                  <div className="game-area">
                    <Snake snakeDots={snakeDots} />
                    <Food dot={foods} />
                  </div>
                  <div classname="report-area">
                  </div>
                </div>
              )}
              </div>
        );
}

export default App;
