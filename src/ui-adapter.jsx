import {VideoDemonstration} from './video-demonstration.jsx';
import {DeviceStatus,DevicePanel} from './device-ui.jsx';
import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {Palette,Sun,Moon,Monitor,ChevronDown,House,CalendarDays,Dumbbell,TrendingUp,Settings} from 'lucide-react';
import {Button} from './components/ui/button';
import {Card} from './components/ui/card';
import {Input} from './components/ui/input';
import {Textarea} from './components/ui/textarea';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from './components/ui/dialog';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuRadioGroup,DropdownMenuRadioItem} from './components/ui/dropdown-menu';
import {THEMES,currentTheme,changeTheme} from './themes.js';

const appRoot=createRoot(document.getElementById('app'));
const modalRoot=createRoot(document.getElementById('dialog-root'));
let revision=0,modalRevision=0,lastFocus;
const booleanProps=new Set(['hidden','disabled','required','multiple','open','autoFocus','readOnly']);
const names={class:'className',for:'htmlFor',tabindex:'tabIndex',maxlength:'maxLength',minlength:'minLength',autocomplete:'autoComplete',inputmode:'inputMode',readonly:'readOnly',autofocus:'autoFocus',colspan:'colSpan',rowspan:'rowSpan'};

function ThemePicker(){
  const [value,setValue]=useState(currentTheme),[message,setMessage]=useState('');
  useEffect(()=>{const refresh=()=>setValue(currentTheme());window.addEventListener('home-training:theme',refresh);return()=>window.removeEventListener('home-training:theme',refresh);},[]);
  const update=patch=>{const saved=changeTheme({...currentTheme(),...patch});setMessage(saved?'Appearance saved.':'Applied for this visit. Browser saving is unavailable.');};
  const AppearanceIcon=value.appearance==='dark'?Moon:value.appearance==='system'?Monitor:Sun;
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" className="theme-trigger" aria-label={`Choose theme. ${THEMES[value.palette].name}, ${value.appearance} appearance`}><Palette aria-hidden="true"/><span className="theme-trigger-label">Appearance</span><ChevronDown className="theme-chevron" aria-hidden="true"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="theme-menu"><DropdownMenuLabel>Choose your palette</DropdownMenuLabel><DropdownMenuRadioGroup value={value.palette} onValueChange={palette=>update({palette})}>{Object.entries(THEMES).map(([id,theme])=><DropdownMenuRadioItem key={id} value={id} className="theme-option"><span className="theme-swatches" aria-hidden="true">{theme.swatches.map(color=><span key={color} style={{backgroundColor:color}}/>)}</span><span><span className="theme-option-title">{theme.name}</span><span className="theme-option-description">{id==='forest'?'Default palette':theme.description}</span></span></DropdownMenuRadioItem>)}</DropdownMenuRadioGroup><DropdownMenuSeparator/><DropdownMenuLabel>Appearance</DropdownMenuLabel><DropdownMenuRadioGroup value={value.appearance} onValueChange={appearance=>update({appearance})}>{[['light','Light',Sun],['dark','Dark',Moon],['system','Follow device',Monitor]].map(([id,label,Icon])=><DropdownMenuRadioItem key={id} value={id}><Icon className="size-4" aria-hidden="true"/>{label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup><div className="theme-menu-note"><AppearanceIcon className="size-3" aria-hidden="true"/>Remembered on this browser</div></DropdownMenuContent></DropdownMenu><span className="theme-announcement" role="status" aria-live="polite">{message}</span></>;
}

function attributes(node){const props={};for(const attr of node.attributes){if(attr.name==='selected'||attr.name==='checked'||attr.name==='value')continue;const key=names[attr.name]||attr.name;if(key==='style'){props.style={};for(let i=0;i<node.style.length;i++){const name=node.style.item(i);const camel=name.startsWith('--')?name:name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());props.style[camel]=node.style.getPropertyValue(name);}continue;}props[key]=booleanProps.has(key)?true:attr.value;}
 if(node.tagName==='INPUT'){props.defaultChecked=node.hasAttribute('checked');if(node.hasAttribute('value'))props.defaultValue=node.getAttribute('value');}
 else if(node.tagName==='SELECT'){props.defaultValue=node.querySelector('option[selected]')?.value||node.options[0]?.value;}
 else if(node.tagName==='TEXTAREA')props.defaultValue=node.textContent;
 else if(node.hasAttribute('value'))props.value=node.getAttribute('value');
 return props;
}

function convert(node,key){if(node.nodeType===3)return node.textContent;if(node.nodeType!==1)return null;const tag=node.tagName.toLowerCase();if(['script','style'].includes(tag))return null;if(node.hasAttribute('data-device-status'))return <DeviceStatus key={key}/>;if(node.hasAttribute('data-device-panel'))return <DevicePanel key={key}/>;if(node.hasAttribute('data-video-slot'))return <VideoDemonstration key={key} exerciseId={node.getAttribute('data-video-slot')}/>;if(node.hasAttribute('data-theme-slot'))return <ThemePicker key={key}/>;
 const props={...attributes(node),key};if(node.classList.contains('nav-icon')){const Icon={home:House,schedule:CalendarDays,library:Dumbbell,progress:TrendingUp,settings:Settings}[node.parentElement?.dataset.nav];if(Icon)return <span {...props}><Icon size={18} aria-hidden="true"/></span>;}const children=tag==='textarea'?undefined:[...node.childNodes].map((child,n)=>convert(child,n));
 if(tag==='button'){const classes=new Set(node.classList);const variant=classes.has('primary')?'default':classes.has('danger-button')?'destructive':classes.has('secondary')||classes.has('button')?'outline':classes.has('text-link')?'link':'ghost';return <Button {...props} variant={variant} data-slot="button">{children}</Button>;}
 if(tag==='input'&&!['checkbox','radio','file','range'].includes(node.type))return <Input {...props} data-slot="input"/>;
 if(tag==='textarea')return <Textarea {...props} data-slot="textarea"/>;
 if(node.classList.contains('card'))return <Card {...props} data-slot="card">{children}</Card>;
 return React.createElement(tag,props,...(children||[]));
}
function markupToReact(markup){const template=document.createElement('template');template.innerHTML=markup;return [...template.content.childNodes].map((node,n)=>convert(node,n));}

export function renderInterface(markup){flushSync(()=>appRoot.render(<React.Fragment key={++revision}>{markupToReact(markup)}</React.Fragment>));}
export function closeInterfaceDialog(){flushSync(()=>modalRoot.render(null));}
export function renderInterfaceDialog({title,body,footer,onClose}){
  if(!document.getElementById('dialog'))lastFocus=document.activeElement;
  flushSync(()=>modalRoot.render(<Dialog key={++modalRevision} open onOpenChange={open=>{if(!open)onClose();}}><DialogContent id="dialog" className="app-dialog" onCloseAutoFocus={event=>{event.preventDefault();if(lastFocus?.isConnected)lastFocus.focus();}}><DialogHeader className="dialog-head"><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">Review the details and choose an action.</DialogDescription></DialogHeader><div className="dialog-body">{markupToReact(body)}</div>{footer&&<div className="dialog-foot">{markupToReact(footer)}</div>}</DialogContent></Dialog>));
}
