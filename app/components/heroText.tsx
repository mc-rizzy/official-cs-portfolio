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
	const mouse = useRef({x: 0, y: 0});
    letterRefs.current = [];

    const textData = [
        {content: "Hi, I'm ", type: "h1", newLine: false},
        {content: "Cracked", type: "h1", mode: "highlight",  newLine: true},
        {content: "Haha lol, no actually my name is Caleb.", type: "p",  newLine: true},
        {content: "I'm a programmer", type: "p",  newLine: true},
		{content: "with a specialty in AI and Robotics.", type: "p",  newLine: true},
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

		physics(mouse: {x: number, y: number}) { 
			let dx = this.targetX - this.x;
			let dy = this.targetY - this.y;
			let move = 0.05; // Slightly faster for better responsiveness
			
			let moveX = dx * move;
			let moveY = dy * move;

			let mouseRepelX = 0;
			let mouseRepelY = 0;
			
			let mdx = this.x - mouse.x;
			let mdy = this.y - mouse.y;
			let mDistance = Math.sqrt(mdx * mdx + mdy * mdy);
			
			const mouseRadius = 100;
			const mouseForce = 5;

			if (mDistance < mouseRadius) {
				let force = (mouseRadius - mDistance) / mouseRadius;
				mouseRepelX = (mdx / mDistance) * force * mouseForce;
				mouseRepelY = (mdy / mDistance) * force * mouseForce;
			}

			this.x += moveX + mouseRepelX;
			this.y += moveY + mouseRepelY;

			if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && mDistance > mouseRadius) {
				this.x = this.targetX;
				this.y = this.targetY;
			}
		}
        update(){
            if(!this.element) return;
            this.element.setAttribute('style', `left: ${this.x}px; top: ${this.y}px; transition: transform 0.15s ease-out;`);
        }
    }

    useEffect(() => {
		if(!initialized.current || !moveLetters) return;
        let letterX = windowSize.width/2;
        // let letterY = heroTextRef.current?.getBoundingClientRect().top || 0;
		let letterY = windowSize.width*0.33;
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

                letterX+=(particle.element?.offsetWidth+5) || 0;
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
        
        let animationFrame: number;
		const frame = () => {
			particleRefs.current.forEach((particle) => {
				particle.physics(mouse.current);
				particle.update();
			});
			animationFrame = requestAnimationFrame(frame);
		};
		animationFrame = requestAnimationFrame(frame);

		const handleMouseMove = (event: any) => {
			if (!heroTextRef.current) return;
			const rect = heroTextRef.current.getBoundingClientRect();

			mouse.current.x = event.clientX;
			mouse.current.y = event.clientY - rect.top;
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			cancelAnimationFrame(animationFrame);
			window.removeEventListener('mousemove', handleMouseMove);
		};
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
						let y = (windowSize.width*0.33);

						let letterElement = (
							<span key={i} style={{ left: `${x}px`, top: `${y}px`}} className={`${textObj.mode} newLine fade-in-hidden`} 
							ref={(el) => {if (el) letterRefs.current.push(el); }}
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