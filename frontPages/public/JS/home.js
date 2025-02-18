// let slideIndex=[1,1,1]
// let sliders=["cat1","cat2","cat3"]

// showSlide()

// function showSlide(){
//     for(let slider=0;slider<sliders.length;slider++){
//     let slides=document.getElementsByClassName(sliders[slider])
//     numOfSlides=slides.length
//     if(slideIndex[slider] > numOfSlides){
//         slideIndex[slider] = 1
//     }
//     for(let i=0;i<numOfSlides;i++){
//         slides[i].style.display="none"
//     }
//     slides[slideIndex[slider]-1].style.display="block"
//     slideIndex[slider] += 1
// }
//     setTimeout(showSlide,1500)
// }