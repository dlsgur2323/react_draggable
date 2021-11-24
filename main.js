'use strict';

const root = React.createElement;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            time: new Date().toLocaleTimeString()
        };
    }

    componentDidMount(){
    }

    render() {

        return (
            <div className="app">
                <CardBoard></CardBoard>
            </div>
        );
    }
}

class CardBoard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            cardIdSeq : 7,
            cardList : [
                { listId : "list1" , list : ["card1","card2"] },
                { listId : "list2" , list : ["card3","card4"] },
                { listId : "list3" , list : ["card5","card6"] }
            ]
        }
    }

    renderCardList(list){
        return list.map((_cardList,i)=>{
            return <CardList key={i} cardList={_cardList}
                    dragover_handler={this.dragover_handler.bind(this)}
                    drop_handler={this.drop_handler.bind(this)}
                    dragstart_handler={this.dragstart_handler.bind(this)}
                    dragend_handler={this.dragend_handler.bind(this)}
                    createCard = {this.createCard.bind(this)}
                    ></CardList>
        })
    }

    moveCard = (newListId, idx, oldListId, cardId) => {
        let cardList = Array.from(this.state.cardList);
        let addable = true;
        cardList.forEach((list)=>{
            if(list.listId == oldListId){
                if(list.list.indexOf(cardId) == idx-1 && newListId == oldListId){
                    addable = false;
                } else {
                    addable = true;
                    list.list.splice(list.list.indexOf(cardId),1);
                }
            }
        });
        cardList.forEach((list)=>{
            if(list.listId == newListId){
                if(addable){
                    list.list.splice(idx,0,cardId);
                }
            }
        });

        this.setState({
            cardList : cardList
        });
    }
    
    createCard(e){
        const cardListId = e.target.parentNode.previousElementSibling.id;
        let cardList = Array.from(this.state.cardList);
        cardList.forEach((list)=>{
            if(list.listId == cardListId){
                const cardId = this.state.cardIdSeq;
                this.setState({
                    cardIdSeq : this.state.cardIdSeq+1
                })
                list.list.push(`card${cardId}`);
            }
        });
        this.setState({
            cardList : cardList
        })
    }

    createMargin(){
        let margin = document.createElement('div');
        margin.className = 'card-margin';
        margin.id="card-drag-direction"
        return margin;
    }
    deleteMargin(){
        let margin = document.getElementById('card-drag-direction');
        if(margin){
            if(margin.previousElementSibling){
              margin.remove();
            } else {
              margin.id = "";
            }
            let mb0 = document.querySelector('.card.mb0');
            if(mb0){
                mb0.classList.remove('mb0');
            }
        }
    }
    
    dragover_handler(e){
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        
        if(e.target.classList.contains("card")){
            let card = e.target;
            const ch = card.offsetHeight;
            const my = e.nativeEvent.offsetY;
            let margin = this.createMargin();

            if(my > ch/2){
              if(card.nextElementSibling){
                if(card.nextElementSibling.className != "card-margin"){
                    this.deleteMargin();
                  card.classList.add('mb0');
                  card.parentNode.insertBefore(margin,card.nextElementSibling);
                } 
              } else {
                  this.deleteMargin();
                card.classList.add('mb0');
                card.parentNode.appendChild(margin);
              }
            } else {
              if(card.previousElementSibling){
                if(card.previousElementSibling.className == "card-margin"){
                  if(card.previousElementSibling.id != "card-drag-direction"){
                    this.deleteMargin();
                    card.previousElementSibling.id="card-drag-direction";
                  }
                } else {
                    this.deleteMargin();
                  card.previousElementSibling.classList.add('mb0');
                  card.parentNode.insertBefore(margin,card);
                }
              }
            }

          } else if(e.target.classList.contains("card-list")){
            let cardList = e.target;
            const clh = cardList.offsetHeight;
            const my = e.nativeEvent.offsetY;
    
            let margin = document.createElement('div');
            margin.className = 'card-margin';
            margin.id="card-drag-direction";
    
            if(cardList.children.length == 1){
              if(cardList.firstElementChild.id != 'card-drag-direction'){
                    this.deleteMargin();
                cardList.firstElementChild.id = "card-drag-direction";
              }
            } else {
              if(my > clh/2){
                if(cardList.lastElementChild.className != "card-margin"){
                    this.deleteMargin();
                  cardList.lastElementChild.classList.add("mb0");
                  cardList.appendChild(margin);
                }
              } else {
                if(cardList.firstElementChild.id != "card-drag-direction"){
                    this.deleteMargin();
                }
                cardList.firstElementChild.id="card-drag-direction";
              }
            }
        }

    }
    drop_handler(e){
        e.preventDefault();
        const cardId = e.dataTransfer.getData("text/palin");
        const newListId = e.currentTarget.id;
        const oldListId = document.getElementById(cardId).parentNode.id;
        const margin = document.getElementById('card-drag-direction');
        const siblings = margin.parentNode.childNodes;
        let idx = 0;
        for(let i=0; i<siblings.length;i++){
            if(siblings[i].id === 'card-drag-direction'){
                break;
            } else if(siblings[i].classList.contains('card')){
                idx++;
            } 
        }
        this.deleteMargin();
        this.moveCard(newListId, idx, oldListId, cardId);
    }
    dragstart_handler(e){
        e.dataTransfer.setData("text/palin",e.target.id);
        e.dataTransfer.setDragImage(e.target, 10,10);
    }
    dragend_handler(e){
        this.deleteMargin();
    }
  
    render(){
        return (
            <div className="card-board">
                {this.renderCardList(this.state.cardList)}
            </div>
        )
    }
}

class CardList extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            cardList : this.props.cardList
        };
    }

    renderCard(list){
        return list.map((card,i)=>{
            return <div className="card"
                        id={card}
                        key={card}
                        draggable="true"
                        onDragStart={this.props.dragstart_handler}
                        onDragEnd={this.props.dragend_handler}>{card}</div>
        });
    }


    render (){
        return (
            <div className="list-body">
                <div className="card-list" id={this.state.cardList.listId} onDrop={this.props.drop_handler} onDragOver={this.props.dragover_handler}>
                    <div className="card-margin"></div>
                    {this.renderCard(this.state.cardList.list)}
                </div>
                <div className="card-control">
                    <button onClick={this.props.createCard}>+</button>
                </div>
            </div>
        )
    }
}




const domContainer = document.querySelector('#root');
ReactDOM.render(root(App), domContainer);