"use client";   
import { useCallback, useEffect, useRef, useState } from "react";
import "../home.css";


export default function HeroText() {

    const heroTextRef = useRef<HTMLDivElement | null>(null);
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const particleRefs = useRef<(Particle)[]>([]);
    const [windowSize, setWindowSize] = useState<{width: number, height: number}>({ width: 0, height: 0 });
    const initialized = useRef(false);
	const [moveLetters, setMoveLetters] = useState(false);
    letterRefs.current = [];

    const textData = [
        {content: "Hi, I'm ", type: "h1", newLine: false},
        {content: "Cracked", type: "h1", mode: "highlight",  newLine: true},
        {content: "Haha lol, no actually my name is Caleb.", type: "p",  newLine: true},
        {content: "I'm a programmer with a specialy in AI and Robotics.", type: "p",  newLine: true},
        {content: "Scroll down for more info! :D", type: "p",  newLine: true},
    ];

    class Particle {
        x: number;
        y: number;
        xv: number;
        yv: number;
        targetX: number;
        targetY: number;
        element: HTMLSpanElement;
        
        constructor(element: HTMLSpanElement) {
            this.x = 0;
            this.y = 0;
            this.xv = 0;
            this.yv = 0;
            this.targetX = 0;
            this.targetY = 0;
            this.element = element;
        }

        physics(){
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;

			let maximum = 10;
			dx = Math.max(Math.min(dx, maximum), -maximum);
			dy = Math.max(Math.min(dy, maximum), -maximum);

			this.xv += dx * 0.1;
			this.yv += dy * 0.1;

			this.xv *= 0.8;
			this.yv *= 0.8;

			this.x += this.xv;
			this.y += this.yv;

            // this.x = this.targetX;
            // this.y = this.targetY;

        }
        update(){
            if(!this.element) return;
            this.element.setAttribute('style', `left: ${this.x}px; top: ${this.y}px; transition: transform 0.15s ease-out;`);
        }
    }

    useEffect(() => {
		if(!initialized.current || !moveLetters) return;
        let letterX = windowSize.width/2;
        let letterY = heroTextRef.current?.getBoundingClientRect().top || 0;
        letterY/=2;

		let counter = 0;
		if(particleRefs.current.length === 0) return;
        textData.forEach((textObj) => {
            let lineHeight = 0;
			Array.from(textObj.content).forEach((letter, i) => {
				let particle = (particleRefs.current[counter]) as Particle;
				particle.x = parseFloat(particle.element.style.left);
				particle.y = parseFloat(particle.element.style.top);
				particle.targetX = letterX;
                particle.targetY = letterY;

                letterX+=particle.element?.offsetWidth || 0;
                let letterHeight = particle.element?.offsetHeight || 0;
                if(letterHeight > lineHeight)
                    lineHeight = letterHeight;
				counter++;
			});
            
            if(textObj.newLine){
                letterY += lineHeight;
                letterX = windowSize.width/2;
            }
        });
        
        setInterval(function(){
			particleRefs.current.forEach((particle) => {
				particle.physics();
				particle.update();
			});
        },10);
    },[initialized, moveLetters]);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });

        const observer = new IntersectionObserver(
        (entries) => {  
            entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
            });
        },
        { threshold: 0.2 }
        );

        const hiddenElements = document.querySelectorAll('.fade-in-hidden');
        hiddenElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
		if (initialized.current || letterRefs.current.length === 0) return;

		particleRefs.current = letterRefs.current.map((el) => {
			if (!el) return null;
			return new Particle(el);
		}).filter(Boolean) as Particle[];

		initialized.current = true;
    }, [windowSize]);

    
    return (<>
      	<div ref={heroTextRef} className="heroText">
			{textData.map((textObj, p) => {
				const Tag = textObj.type;

				return <Tag key={p}>{
					Array.from(textObj.content).map((letter, i) => {
						let x = (windowSize.width/2)+(Math.random()*(windowSize.width*0.9)/2);
						let y = (windowSize.width*0.8/2)/2;

						// let letterRef;
						let letterElement = (
							<span key={i} style={{ left: `${x}px`, top: `${y}px`}} className={`${textObj.mode} newLine fade-in-hidden`} 
							ref={(el) => {
								if (el){
									// letterRef = el;
									// particleRefs.current.push(new Particle(x, y, letterRef));
									letterRefs.current.push(el); 
								}}}
								onTransitionEnd={(e) => {
									e.currentTarget.classList.remove('fade-in-hidden');
									e.currentTarget.classList.add('funLetter');
									if(p == textData.length - 1 && i == textObj.content.length - 1)
										setMoveLetters(true);
							}}>{letter}</span>
						);

						return letterElement;
					})}</Tag>
			})}
      	</div>
  </>);
}