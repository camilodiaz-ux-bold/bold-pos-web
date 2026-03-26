import svgPaths from "./svg-ydarkl2s8j";
import imgFavicon from "figma:asset/0c96ccfbda7bda53f39c1437cf5bb8dbdf5b6a60.png";
import imgFilesFlImg from "figma:asset/ee1d6f5ab6f4fcfcfb0ea388906c8161f6bcb3e3.png";
import imgFilesFlImg1 from "figma:asset/ec3fafc55c2b4fc81037a4f644bf8eda6ac1269c.png";
import imgFilesFlImg2 from "figma:asset/4bb54a3c65a95c2695cc60ebd207f0f5bf20519d.png";
import imgFilesFlImg3 from "figma:asset/58ab39a73621db1dfc6955afe74f39418eb91f7b.png";
import imgFilesFlImg4 from "figma:asset/4881564865a1329b6f0b4e0adf7aa8f7314b9ea3.png";

function Group2() {
  return (
    <div className="absolute contents left-[calc(100%+17px)] top-[82px]">
      <div className="absolute bg-[rgba(241,242,246,0.02)] h-[35px] left-[calc(100%+17px)] top-[82px] w-[75px]" />
    </div>
  );
}

function Close() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Close">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Close">
          <path clipRule="evenodd" d={svgPaths.p36a74680} fill="var(--fill-0, #3C4043)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Content() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center overflow-clip pl-[8px] pr-[4px] py-[8px] relative rounded-tl-[8px] rounded-tr-[8px] shrink-0" data-name="Content">
      <div className="relative shrink-0 size-[16px]" data-name="Favicon">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFavicon} />
      </div>
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#494c4f] text-[12px] tracking-[0.2px] whitespace-nowrap" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        <p className="leading-[normal]">BoldPOS</p>
      </div>
      <Close />
    </div>
  );
}

function TabActive() {
  return (
    <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Tab active">
      <div className="h-[8px] relative shrink-0 w-[6px]" data-name="Curve L">
        <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
          <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve L" />
        </svg>
      </div>
      <Content />
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="h-[8px] relative w-[6px]" data-name="Curve R">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 6 8">
              <path clipRule="evenodd" d={svgPaths.p2ea0ec00} fill="var(--fill-0, white)" fillRule="evenodd" id="Curve R" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Plus">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Plus">
          <path clipRule="evenodd" d={svgPaths.p2320e500} fill="var(--fill-0, #3C4043)" fillRule="evenodd" id="Icon - New Tab" />
        </g>
      </svg>
    </div>
  );
}

function EndTab() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 z-[1]" data-name="End Tab">
      <TabActive />
      <Plus />
    </div>
  );
}

function Tabs() {
  return (
    <div className="absolute content-stretch flex isolate items-center left-[78px] top-[8px]" data-name="Tabs">
      <EndTab />
    </div>
  );
}

function BrowserControls() {
  return (
    <div className="-translate-y-1/2 absolute h-[12px] left-[13px] top-1/2 w-[52px]" data-name="Browser Controls">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 52 12">
        <g id="Browser Controls">
          <circle cx="6" cy="6" fill="var(--fill-0, #FF6058)" id="Option - Close" r="5.75" stroke="var(--stroke-0, #E14942)" strokeWidth="0.5" />
          <circle cx="26" cy="6" fill="var(--fill-0, #FFC130)" id="Option - Minimize" r="5.75" stroke="var(--stroke-0, #E1A325)" strokeWidth="0.5" />
          <circle cx="46" cy="6" fill="var(--fill-0, #27CA40)" id="Option - Expand" r="5.75" stroke="var(--stroke-0, #3EAF3F)" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

function ToolbarBrowserControls() {
  return (
    <div className="bg-[#dee1e6] h-[42px] relative shrink-0 w-full" data-name="Toolbar - Browser Controls">
      <Tabs />
      <BrowserControls />
    </div>
  );
}

function ToolbarUrlControls1() {
  return <div className="absolute h-[38px] left-0 right-0 top-0" data-name="Toolbar - URL Controls" />;
}

function IconMore() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon - More">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon - More">
          <path clipRule="evenodd" d={svgPaths.p35109ec0} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function RightLockedIcons() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex items-center right-[14px] top-1/2" data-name="Right Locked Icons">
      <IconMore />
    </div>
  );
}

function IconSecure() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon - Secure">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon - Secure">
          <path clipRule="evenodd" d={svgPaths.p2503ec80} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex font-['Roboto:Regular',sans-serif] font-normal items-center leading-[0] relative shrink-0 text-[14px] tracking-[0.25px] whitespace-nowrap" data-name="Text">
      <div className="flex flex-col justify-center relative shrink-0 text-[#202124]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        <p className="leading-[normal]">pos.bold.co</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#696a6c]" style={{ fontVariationSettings: "\'wdth\' 100" }}>
        <p className="leading-[normal]">/cotizaciones/</p>
      </div>
    </div>
  );
}

function Left() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Left">
      <IconSecure />
      <Text />
    </div>
  );
}

function IconFavorite() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon - Favorite">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon - Favorite">
          <path clipRule="evenodd" d={svgPaths.p127de900} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Url() {
  return (
    <div className="absolute bg-[#f1f3f4] content-stretch flex items-center justify-between left-[134px] px-[10px] py-[6px] right-[43px] rounded-[16px] top-[5px]" data-name="URL">
      <Left />
      <IconFavorite />
    </div>
  );
}

function Back() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Back">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Back">
          <path clipRule="evenodd" d={svgPaths.p18d60780} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Forward() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Forward">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Forward">
          <path clipRule="evenodd" d={svgPaths.p245be700} fill="var(--fill-0, #BABCBE)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Refresh() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Refresh">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Refresh">
          <path clipRule="evenodd" d={svgPaths.p6e12800} fill="var(--fill-0, #5F6368)" fillRule="evenodd" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function Home() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Home">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Home">
          <path d={svgPaths.p38af0f40} fill="var(--fill-0, #5F6368)" id="Container" />
        </g>
      </svg>
    </div>
  );
}

function LeftLockedIcons() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex gap-[15px] items-start left-[12px] top-1/2" data-name="Left Locked Icons">
      <Back />
      <Forward />
      <Refresh />
      <Home />
    </div>
  );
}

function ToolbarUrlControls() {
  return (
    <div className="bg-white h-[38px] relative shrink-0 w-full" data-name="Toolbar - URL Controls">
      <div aria-hidden="true" className="absolute border-[#dadce0] border-b border-solid inset-0 pointer-events-none" />
      <ToolbarUrlControls1 />
      <RightLockedIcons />
      <Url />
      <LeftLockedIcons />
    </div>
  );
}

function Actions() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Actions">
      <div className="relative rounded-[100px] shrink-0 size-[40px]" data-name="WEB Button / Icon">
        <div className="absolute inset-[15%]" data-name="icon/ic_help">
          <div className="absolute inset-[8.33%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 23.3333 23.3333">
              <g id="Vector">
                <path clipRule="evenodd" d={svgPaths.p26351f40} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p27058580} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path d={svgPaths.p32f69c00} fill="var(--fill-0, #121E6C)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="relative rounded-[100px] shrink-0 size-[40px]" data-name="WEB Button / Icon">
        <div className="absolute inset-[15%] rounded-[5px]" data-name="Color=White">
          <div className="absolute inset-[15%_20.78%_15%_20%]" data-name="Union">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 15.961 19.5996">
              <path d={svgPaths.p2031400} fill="var(--fill-0, #121E6C)" id="Union" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-[#121e6c] content-stretch flex flex-col items-center justify-center p-[2px] relative rounded-[100px] shrink-0 size-[32px]" data-name="icon/ic_merchant_id">
        <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px relative text-[14px] text-center text-white w-full">
          <p className="leading-[20px] whitespace-pre-wrap">RA</p>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="h-[22px] relative shrink-0 w-[20px]">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 22">
        <g id="Group 288">
          <rect height="21" id="Rectangle 26" rx="2.5" stroke="var(--stroke-0, #121E6C)" width="19" x="0.5" y="0.5" />
          <path d="M11 6L16 11L11 16" id="Vector 78" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" />
          <path d="M7.5 0.5V21.5" id="Vector 79" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]">
      <Group />
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex h-[52px] items-start relative shrink-0">
      <Frame />
    </div>
  );
}

function Options() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div aria-hidden="true" className="absolute border border-[#d2d4e1] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_Sucursal">
              <div className="absolute inset-[30%_6.34%_4.13%_6.48%]" data-name="Vector (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9496 10.5403">
                  <path clipRule="evenodd" d={svgPaths.p3855dc00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector (Stroke)" />
                </svg>
              </div>
              <div className="absolute inset-[15%_20%_65%_20%]" data-name="Rectangle 1666 (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 9.6 3.2">
                  <path clipRule="evenodd" d={svgPaths.p3f205200} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Rectangle 1666 (Stroke)" />
                </svg>
              </div>
              <div className="absolute inset-[5%_30%_80%_30%]" data-name="Rectangle 1667 (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 6.4 2.4">
                  <path clipRule="evenodd" d={svgPaths.p39d00c00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Rectangle 1667 (Stroke)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
      <Options />
    </div>
  );
}

function Options1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="bg-[#121e6c] relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon/ic_add">
              <div className="absolute inset-[16.67%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p9ba8d00} fill="var(--fill-0, white)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p101a3500} fill="var(--fill-0, white)" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Category">
      <Options1 />
    </div>
  );
}

function Options3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="bg-[#f1f2f6] relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_home">
              <div className="absolute inset-[4.17%_6.04%_2.25%_4.17%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.3667 14.9733">
                  <path clipRule="evenodd" d={svgPaths.p2c299180} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[44px]" data-name="Category">
      <Options3 />
    </div>
  );
}

function Options2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <Category3 />
    </div>
  );
}

function Category2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Category">
      <Options2 />
    </div>
  );
}

function Options4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon_fill/ic_POS">
              <div className="absolute inset-[16.67%_16.67%_20.83%_16.67%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10">
                  <path d={svgPaths.p259247c0} fill="var(--fill-0, #606060)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Category">
      <Options4 />
    </div>
  );
}

function Options5() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon_fill/ic_money">
              <div className="absolute inset-[4.17%]" data-name="Subtract">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
                  <path clipRule="evenodd" d={svgPaths.p33752800} fill="var(--fill-0, #606060)" fillRule="evenodd" id="Subtract" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Category5() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Category">
      <Options5 />
    </div>
  );
}

function Options6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon_fill/ic_sale">
              <div className="absolute inset-[4.17%_13.3%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 11.7433 14.6667">
                  <g id="Vector">
                    <path d={svgPaths.p1bc31500} fill="var(--fill-0, #606060)" />
                    <path d={svgPaths.pe3ea700} fill="white" />
                    <path d={svgPaths.p35526d00} fill="white" />
                    <path d={svgPaths.p2f28bb00} fill="var(--fill-0, #606060)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Options8() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_users">
              <div className="absolute inset-[5.65%_3.75%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8002 14.1933">
                  <path clipRule="evenodd" d={svgPaths.p3eda4380} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Options7() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 w-full" data-name="Options">
      <Options8 />
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_hand_bill_vert">
              <div className="absolute inset-[4.17%_22.29%_3.29%_20.83%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 9.1 14.8067">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p3b20fd80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p1e143000} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p29459f00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p67ddd00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p2c20da00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p2cb294f0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p219ecc00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p4a3f600} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3520c500} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_chart">
              <div className="absolute inset-[9.5%_4.5%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.56 12.96">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p9bf4180} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p34fffa00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p5d6fc00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3f43a400} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.pced04f0} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p25551c00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_settings">
              <div className="absolute inset-[4.5%_8.1%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 13.408 14.56">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p165ec280} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3f7d8500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p329f3600} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p2cb15e00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p18a3d980} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p15adf880} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.pef8fd00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p24486800} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.pf4c7d80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p2041fac0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p3d87fba0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p548e300} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p1f6e5ff0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative rounded-[8px] shrink-0 w-full" data-name=".atom/panel_menu">
        <div className="flex flex-row items-center justify-center size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center p-[8px] relative w-full">
            <div className="relative shrink-0 size-[16px]" data-name="icon/ic_comment">
              <div className="absolute inset-[8.33%_3.33%_8.66%_4.17%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8 13.2803">
                  <g id="Vector">
                    <path clipRule="evenodd" d={svgPaths.p3c542b00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p118dbb00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p13008500} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p1e18cc80} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                    <path clipRule="evenodd" d={svgPaths.p19aa5e00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebMenuMain() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] h-[521px] items-center pb-[8px] pt-[16px] px-[8px] relative rounded-[16px] shrink-0 w-[60px]" data-name="WEB Menu / Main">
      <Frame23 />
      <Category />
      <Category1 />
      <Category2 />
      <Category4 />
      <Category5 />
      <Options6 />
      <Options7 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[20px] items-center relative shrink-0 w-full">
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Text inputs">
        <div className="content-stretch flex gap-[12px] items-start justify-end relative shrink-0 w-full" data-name=".atom/text_input_labels">
          <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#121e6c] text-[14px]">
            <p className="leading-[20px] whitespace-pre-wrap">Numeración</p>
          </div>
        </div>
        <div className="bg-[#f7f8fb] h-[40px] relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
              <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name=".atom/text_input_labels">
                <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
                  <p className="leading-[20px] whitespace-pre-wrap">Caja 1 - # 1234567890</p>
                </div>
              </div>
              <div className="relative shrink-0 size-[24px]" data-name="icon/ic_chevron">
                <div className="absolute bottom-[26.39%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector 2 (Stroke)">
                  <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                    <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Text inputs">
        <div className="content-stretch flex gap-[12px] items-start justify-end relative shrink-0 w-full" data-name=".atom/text_input_labels">
          <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#121e6c] text-[14px]">
            <p className="leading-[20px] whitespace-pre-wrap">Lista de precio</p>
          </div>
        </div>
        <div className="bg-[#f7f8fb] h-[40px] relative rounded-[12px] shrink-0 w-full" data-name=".atom/text_input_fields">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
              <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name=".atom/text_input_labels">
                <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
                  <p className="leading-[20px] whitespace-pre-wrap">General</p>
                </div>
              </div>
              <div className="relative shrink-0 size-[24px]" data-name="icon/ic_chevron">
                <div className="absolute bottom-[26.39%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector 2 (Stroke)">
                  <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                    <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextInputs1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="Text inputs">
      <div className="bg-[#f7f8fb] flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[12px]" data-name=".atom/text_input_fields">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[12px] items-center px-[12px] py-[8px] relative size-full">
            <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name=".atom/text_input_labels">
              <div className="absolute flex flex-col font-['Montserrat:Medium',sans-serif] font-medium inset-0 justify-center leading-[0] text-[#1e1e1e] text-[14px]">
                <p className="leading-[20px] whitespace-pre-wrap">Consumidor final</p>
              </div>
            </div>
            <div className="relative shrink-0 size-[24px]" data-name="icon/ic_chevron">
              <div className="absolute bottom-[26.39%] left-[8.33%] right-[8.33%] top-1/4" data-name="Vector 2 (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                  <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextInputs() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-start min-h-px min-w-px relative" data-name="Text inputs">
      <TextInputs1 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex gap-[14px] items-end justify-end relative shrink-0 w-full">
      <TextInputs />
      <div className="content-stretch flex gap-[4px] h-[40px] items-center justify-center py-[12px] relative shrink-0" data-name="App text button">
        <div className="relative shrink-0 size-[24px]" data-name="icon/ic_tooltip">
          <div className="absolute inset-[7.48%_3.75%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 22.1985 20.41">
              <g id="Vector">
                <path clipRule="evenodd" d={svgPaths.p3d846980} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p4265a80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p11865500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p76ca0c0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p21218840} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p368f4a80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p222772c0} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p3dc70b00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
      <Frame12 />
      <Frame20 />
    </div>
  );
}

function Level() {
  return (
    <div className="content-stretch flex gap-[8px] h-[36px] items-center relative shrink-0 w-full" data-name="Level 1">
      <div className="content-stretch flex flex-[1_0_0] h-[36px] items-center min-h-px min-w-px relative" data-name=".atom/labels_card_historial">
        <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium h-full justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
          <p className="leading-[20px] whitespace-pre-wrap">Estuche Organizador de Cables</p>
        </div>
      </div>
      <div className="content-stretch flex h-[32px] items-start justify-end relative shrink-0 w-[116px]" data-name=".atom/labels_card_historial">
        <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Bold',sans-serif] font-bold h-full justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px] text-right">
          <p className="leading-[20px] whitespace-pre-wrap">$38,000</p>
        </div>
      </div>
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon/ic_menu">
        <div className="absolute inset-[12.5%_41.67%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 3.33333 15">
            <g id="Vector">
              <path d={svgPaths.pfeb8880} fill="var(--fill-0, #121E6C)" />
              <path d={svgPaths.p39a9a880} fill="var(--fill-0, #121E6C)" />
              <path d={svgPaths.p3b105f80} fill="var(--fill-0, #121E6C)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Level2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-[29px] items-end justify-end min-h-px min-w-px relative" data-name="Level 2">
      <div className="content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px relative w-full" data-name=".atom/labels_card_historial">
        <div className="flex flex-col font-['Montserrat:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#1e1e1e] text-[14px] text-right whitespace-nowrap">
          <p className="leading-[20px]">{`Ref 001 - Ud $38,000 `}</p>
        </div>
      </div>
    </div>
  );
}

function Less() {
  return (
    <div className="absolute inset-[4.17%]" data-name="less">
      <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 26.5833 26.5833">
        <g id="less">
          <path d={svgPaths.p177dd270} fill="var(--fill-0, #FEF1F3)" id="Ellipse 3" />
          <path clipRule="evenodd" d={svgPaths.p12dd0300} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Ellipse 3 (Stroke)" />
          <path clipRule="evenodd" d={svgPaths.p1c6b4f80} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector 5 (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[29px]" data-name="icon/ic_controls">
        <Less />
      </div>
      <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#1e1e1e] text-[16px] text-center w-[29px]">
        <p className="leading-[24px] whitespace-pre-wrap">1</p>
      </div>
      <div className="relative shrink-0 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #EE424E)" id="Ellipse 3" r="12.8333" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector (Stroke)">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector (Stroke)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-center flex flex-wrap gap-[67px] items-center relative shrink-0 w-full">
      <Level2 />
      <Frame4 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
      <Frame10 />
    </div>
  );
}

function Level1() {
  return (
    <div className="content-center flex flex-wrap gap-[10px] items-center relative shrink-0 w-full" data-name="Level 2">
      <Frame9 />
    </div>
  );
}

function Info() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end justify-center relative shrink-0 w-full" data-name="Info">
      <Level />
      <Level1 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Info />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col items-end justify-center relative shrink-0 w-full">
      <Frame8 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[497px]">
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 497.5 0.5">
            <path d="M0.25 0.25H497.25" id="Vector 24" stroke="var(--stroke-0, #D2D4E1)" strokeLinecap="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      <Frame7 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.25px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 497.5 0.5">
            <path d="M0.25 0.25H497.25" id="Vector 24" stroke="var(--stroke-0, #D2D4E1)" strokeLinecap="round" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col gap-[26px] items-start relative shrink-0">
      <Frame19 />
      <Frame6 />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex items-center pl-[8px] relative rounded-[100px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] text-center whitespace-nowrap">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] underline">Agregar notas</p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] min-h-px min-w-px relative text-[#1e1e1e] text-[14px]">
        <p className="leading-[20px] whitespace-pre-wrap">Detalle a cobrar</p>
      </div>
      <div className="content-stretch flex gap-[4px] items-center justify-end relative shrink-0 w-[122px]" data-name="App text button">
        <Button />
        <div className="relative shrink-0 size-[20px]" data-name="icon/ic_chevron">
          <div className="absolute inset-[4.29%_14.06%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.375 18.2833">
              <g id="Vector">
                <path clipRule="evenodd" d={svgPaths.p3f857200} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.pe3a4c80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p2dfc7180} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p23ce6af1} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p3583d780} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Level4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Level 3">
      <div className="h-[16px] relative shrink-0 w-[72px]" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px]">
          <p className="leading-[16px] whitespace-pre-wrap">Impuesto</p>
        </div>
      </div>
      <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px] text-right">
          <p className="leading-[16px] whitespace-pre-wrap">$0</p>
        </div>
      </div>
    </div>
  );
}

function Level5() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Level 4">
      <div className="h-[16px] relative shrink-0 w-[72px]" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px]">
          <p className="leading-[16px] whitespace-pre-wrap">Impuesto</p>
        </div>
      </div>
      <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px] text-right">
          <p className="leading-[16px] whitespace-pre-wrap">$0</p>
        </div>
      </div>
    </div>
  );
}

function Level6() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Level 5">
      <div className="h-[16px] relative shrink-0 w-[72px]" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px]">
          <p className="leading-[16px] whitespace-pre-wrap">Subtotal</p>
        </div>
      </div>
      <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px] text-right">
          <p className="leading-[16px] whitespace-pre-wrap">$45,310</p>
        </div>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex items-center relative rounded-[100px] shrink-0" data-name="Button">
      <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] text-center whitespace-nowrap">
        <p className="[text-decoration-skip-ink:none] decoration-solid leading-[16px] underline">Agregar</p>
      </div>
    </div>
  );
}

function Level7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Level 2">
      <div className="h-[16px] relative shrink-0 w-[72px]" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px]">
          <p className="leading-[16px] whitespace-pre-wrap">Descuento</p>
        </div>
      </div>
      <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="App text button">
        <Button1 />
      </div>
      <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Atom texts History cards">
        <div className="absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] text-[#1e1e1e] text-[12px] text-right">
          <p className="leading-[16px] whitespace-pre-wrap">$0</p>
        </div>
      </div>
    </div>
  );
}

function Level3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-h-px min-w-px relative" data-name="Level 3">
      <Level4 />
      <Level5 />
      <Level6 />
      <Level7 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-center flex flex-wrap gap-y-[22px] items-center relative shrink-0 w-full">
      <Level3 />
    </div>
  );
}

function Info1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-end justify-center relative shrink-0 w-full" data-name="Info">
      <Label />
      <Frame11 />
    </div>
  );
}

function ButtonPayments() {
  return (
    <div className="bg-[#ee424e] flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[100px]" data-name="Button Payments">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[16px] items-center justify-center px-[25px] py-[24px] relative size-full">
          <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white uppercase whitespace-nowrap">
            <p className="leading-[20px]">CObrar (3 ítems)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex h-[48px] items-start justify-end relative shrink-0 w-full">
      <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative" data-name="APP Button / Default">
        <ButtonPayments />
      </div>
    </div>
  );
}

function AppButtonDefault() {
  return (
    <div className="bg-white relative shrink-0 w-full" data-name="APP Button / Default">
      <div aria-hidden="true" className="absolute border-[#f1f2f6] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-col justify-end size-full">
        <div className="content-stretch flex flex-col gap-[18px] items-start justify-end p-[20px] relative w-full">
          <Info1 />
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function ModalLateral() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[369px] h-[852px] items-center justify-end left-[calc(58.33%-18.67px)] overflow-clip pt-[18px] rounded-bl-[16px] rounded-tl-[16px] top-[144px] w-[551px]" data-name="Modal lateral">
      <Frame18 />
      <AppButtonDefault />
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents left-[calc(58.33%-18.67px)] top-[144px]">
      <ModalLateral />
      <div className="absolute flex h-[194.822px] items-center justify-center left-[calc(100%-11.07px)] top-[430.07px] w-[4.029px]">
        <div className="-scale-y-100 flex-none rotate-180">
          <div className="bg-[#d2d4e1] h-[194.822px] rounded-[4px] w-[4.029px]" />
        </div>
      </div>
    </div>
  );
}

function AtomSearchBarStyles() {
  return (
    <div className="content-stretch flex items-start px-[4px] py-[8px] relative shrink-0" data-name=".atom/search_bar_styles">
      <div className="flex flex-col font-['Montserrat:Light',sans-serif] font-light justify-center leading-[0] relative shrink-0 text-[#606060] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Busca por nombre</p>
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="bg-white h-[40px] relative rounded-[30px] shrink-0 w-full" data-name="Search bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center p-[12px] relative size-full">
          <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] h-[24px] items-center justify-center p-[6px] relative rounded-[22px] shrink-0 w-[32px]" data-name=".atom/panel_menu">
            <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon/ic_search">
              <div className="absolute inset-[4.17%_8.33%_6.57%_8.33%]" data-name="Vector">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.2814">
                  <path clipRule="evenodd" d={svgPaths.p687bb00} fill="var(--fill-0, #1E1E1E)" fillRule="evenodd" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[18px]" data-name="icon/ic_scan">
            <div className="absolute inset-[12.69%_8.98%]" data-name="Vector">
              <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 14.7675 13.4331">
                <g id="Vector">
                  <path clipRule="evenodd" d={svgPaths.p139fb200} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p299eab80} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p23283100} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p5dd4780} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p3f0a480} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                </g>
              </svg>
            </div>
          </div>
          <AtomSearchBarStyles />
        </div>
      </div>
    </div>
  );
}

function WebAppSearchBar() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative" data-name="WEB/APP Search bar">
      <SearchBar />
    </div>
  );
}

function Filter() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Filter">
      <WebAppSearchBar />
      <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] items-center justify-center p-[16px] relative rounded-[32px] shrink-0 size-[40px]" data-name="WEB Button / Floating">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon/ic_filter">
          <div className="absolute inset-[16.67%_0_15.81%_0]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 24 16.2048">
              <g id="Vector">
                <path clipRule="evenodd" d={svgPaths.p2ff2ec40} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p33334580} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p369c000} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p259bc880} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p2f036500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p3848dc00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] items-center justify-center p-[16px] relative rounded-[32px] shrink-0 size-[40px]" data-name="WEB Button / Floating">
        <div className="relative shrink-0 size-[24px]" data-name="icon/ic_no_item">
          <div className="absolute inset-[10.42%]" data-name="Vector (Stroke)">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
              <path d={svgPaths.p14427500} fill="var(--fill-0, #121E6C)" id="Vector (Stroke)" />
            </svg>
          </div>
          <div className="absolute inset-[10.21%]" data-name="Vector (Stroke) (Stroke)">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 19.0996 19.0996">
              <path d={svgPaths.pd9b2100} fill="var(--fill-0, #121E6C)" id="Vector (Stroke) (Stroke)" />
            </svg>
          </div>
          <div className="absolute inset-[29.17%_37.5%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
              <g id="Vector">
                <path d={svgPaths.p4d1fb80} fill="var(--fill-0, #121E6C)" />
                <path d={svgPaths.p2878cc00} fill="var(--fill-0, #121E6C)" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-[28.75%_37.08%]" data-name="Vector (Stroke)">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 6.19922 10.1992">
              <path d={svgPaths.p3cf4ef00} fill="var(--fill-0, #121E6C)" id="Vector (Stroke)" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] items-center justify-center p-[16px] relative rounded-[32px] shrink-0 size-[40px]" data-name="WEB Button / Floating">
        <div className="relative shrink-0 size-[24px]" data-name="icon/ic_new_item">
          <div className="absolute inset-[4.06%_14.76%_2.08%_14.56%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16.9628 22.525">
              <g id="Vector">
                <path d={svgPaths.p195bcf00} fill="var(--fill-0, #121E6C)" />
                <path d={svgPaths.p2817ec80} fill="var(--fill-0, #121E6C)" />
                <path clipRule="evenodd" d={svgPaths.p18a29100} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path d={svgPaths.p3ed57ff0} fill="var(--fill-0, #121E6C)" />
                <path d={svgPaths.p2f30c680} fill="var(--fill-0, #121E6C)" />
                <path d={svgPaths.p1777f000} fill="var(--fill-0, #121E6C)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabsTags() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full" data-name="Tabs + tags">
      <Filter />
    </div>
  );
}

function Image() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg} />
      </div>
    </div>
  );
}

function Info2() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Tennis Addidas Negro</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$250.000</p>
          </div>
        </div>
      </div>
      <Info2 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg1} />
      </div>
    </div>
  );
}

function Info3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Polo Hombre Negra</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card1() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image1 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$50.000</p>
          </div>
        </div>
      </div>
      <Info3 />
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card1 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image2() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info4() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Dolce & Gabbana Bolso`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card2() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image2 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$1.660.132</p>
          </div>
        </div>
      </div>
      <Info4 />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card2 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image3() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg2} />
      </div>
    </div>
  );
}

function Info5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Gorra azul oscuro Nike n...</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card3() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image3 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$90.000</p>
          </div>
        </div>
      </div>
      <Info5 />
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card3 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image4() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info6() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Dolce & Gabbana Bolso`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card4() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image4 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$1.660.132</p>
          </div>
        </div>
      </div>
      <Info6 />
    </div>
  );
}

function Group8() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card4 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[22px] items-start relative shrink-0 w-[600px]">
      <Group3 />
      <Group4 />
      <Group5 />
      <Group6 />
      <Group8 />
    </div>
  );
}

function Image5() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg3} />
      </div>
    </div>
  );
}

function Info7() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Medias Antideslizantes</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card5() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image5 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$34.900</p>
          </div>
        </div>
      </div>
      <Info7 />
    </div>
  );
}

function Group7() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card5 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image6() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg4} />
      </div>
    </div>
  );
}

function Info8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Gorra Negra True</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card6() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image6 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$150.000</p>
          </div>
        </div>
      </div>
      <Info8 />
    </div>
  );
}

function Group9() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card6 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image7() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info9() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Paquete de medias Koaj...</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card7() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image7 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$1.660.132</p>
          </div>
        </div>
      </div>
      <Info9 />
    </div>
  );
}

function Group10() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card7 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image8() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info10() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Gorra Blanca  Nike...`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card8() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image8 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$90.000</p>
          </div>
        </div>
      </div>
      <Info10 />
    </div>
  );
}

function Group11() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card8 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image9() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info11() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Gorra Blanca  Nike...`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card9() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image9 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$90.000</p>
          </div>
        </div>
      </div>
      <Info11 />
    </div>
  );
}

function Group13() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card9 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex gap-[22px] items-start relative shrink-0 w-[600px]">
      <Group7 />
      <Group9 />
      <Group10 />
      <Group11 />
      <Group13 />
    </div>
  );
}

function Image10() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg3} />
      </div>
    </div>
  );
}

function Info12() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Medias Antideslizantes</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card10() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image10 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$34.900</p>
          </div>
        </div>
      </div>
      <Info12 />
    </div>
  );
}

function Group14() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card10 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image11() {
  return (
    <div className="bg-[#f7f8fb] content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_img">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgFilesFlImg4} />
      </div>
    </div>
  );
}

function Info13() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Gorra Negra True</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card11() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image11 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$150.000</p>
          </div>
        </div>
      </div>
      <Info13 />
    </div>
  );
}

function Group15() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card11 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image12() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info14() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">Paquete de medias Koaj...</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card12() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image12 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$1.660.132</p>
          </div>
        </div>
      </div>
      <Info14 />
    </div>
  );
}

function Group16() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card12 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image13() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info15() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Gorra Blanca  Nike...`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card13() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image13 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$90.000</p>
          </div>
        </div>
      </div>
      <Info15 />
    </div>
  );
}

function Group17() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card13 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Image14() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center overflow-clip relative rounded-[12px] shrink-0 size-[96px]" data-name="Image">
      <div className="relative shrink-0 size-[96px]" data-name="files/fl_default_img">
        <div className="absolute inset-[31.25%_26.56%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 45 36">
            <path d={svgPaths.p1f3bd4c0} fill="var(--fill-0, #6C759F)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Info16() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start leading-[16px] relative shrink-0 text-[#1e1e1e] text-[12px] w-[96px] whitespace-pre-wrap" data-name="Info">
      <p className="font-['Montserrat:Medium',sans-serif] font-medium relative shrink-0 w-full">{`Gorra Blanca  Nike...`}</p>
      <p className="font-['Montserrat:Regular',sans-serif] font-normal relative shrink-0 w-full">I917274</p>
    </div>
  );
}

function Card14() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-center ml-0 mt-[8px] relative rounded-[12px] row-1" data-name="Card">
      <Image14 />
      <div className="bg-white content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[4px] relative rounded-[100px] shrink-0 w-[96px]" data-name="WEB/APP Tag">
        <div className="content-stretch flex items-start relative shrink-0" data-name=".atom/tag_label">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3e4983] text-[12px] text-center whitespace-nowrap">
            <p className="leading-[16px]">$90.000</p>
          </div>
        </div>
      </div>
      <Info16 />
    </div>
  );
}

function Group18() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
      <Card14 />
      <div className="col-1 ml-[76px] mt-0 relative row-1 size-[28px]" data-name="icon/ic_controls">
        <div className="absolute inset-[4.17%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 25.6667 25.6667">
            <circle cx="12.8333" cy="12.8333" fill="var(--fill-0, #FEF1F3)" id="Vector" r="12.3333" stroke="var(--stroke-0, #EE424E)" />
          </svg>
        </div>
        <div className="absolute inset-[27.93%]" data-name="Vector">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 12.358 12.358">
            <path clipRule="evenodd" d={svgPaths.p19dbe8f0} fill="var(--fill-0, #EE424E)" fillRule="evenodd" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[22px] items-start relative shrink-0 w-[600px]">
      <Group14 />
      <Group15 />
      <Group16 />
      <Group17 />
      <Group18 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start leading-[0] relative shrink-0">
      <Frame1 />
      <Frame16 />
      <Frame17 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="col-1 content-stretch flex flex-col items-start ml-0 mt-0 relative row-1">
      <Frame3 />
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Frame2 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-full">
      <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] items-center justify-center p-[16px] relative rounded-[32px] shrink-0 size-[40px]" data-name="WEB Button / Floating">
        <div className="relative shrink-0 size-[24px]" data-name="Direction=Left">
          <div className="absolute flex inset-[8.33%_25.71%_8.33%_25.68%] items-center justify-center">
            <div className="flex-none h-[11.667px] rotate-90 w-[20px]">
              <div className="relative size-full" data-name="Vector 2 (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                  <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex gap-[4px] h-[40px] items-start relative rounded-[100px] shrink-0 w-[512px]" data-name="WEB Tabs">
        <div className="bg-[#121e6c] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs">
          <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-center justify-center px-[16px] relative size-full">
              <div className="flex flex-col font-['Montserrat:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[12px] text-white whitespace-nowrap">
                <p className="leading-[16px]">Todos</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center px-[16px] relative size-full">
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] whitespace-nowrap">
                <p className="leading-[16px]">General</p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#121e6c] border-solid inset-0 pointer-events-none rounded-[100px]" />
        </div>
        <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center px-[16px] relative size-full">
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] whitespace-nowrap">
                <p className="leading-[16px]">{`Zapatos `}</p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#121e6c] border-solid inset-0 pointer-events-none rounded-[100px]" />
        </div>
        <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center px-[16px] relative size-full">
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] whitespace-nowrap">
                <p className="leading-[16px]">Gorras</p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#121e6c] border-solid inset-0 pointer-events-none rounded-[100px]" />
        </div>
        <div className="flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[100px]" data-name=".atom/tabs">
          <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center justify-center px-[16px] relative size-full">
              <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[12px] whitespace-nowrap">
                <p className="leading-[16px]">Medias</p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute border border-[#121e6c] border-solid inset-0 pointer-events-none rounded-[100px]" />
        </div>
      </div>
      <div className="bg-[#f1f2f6] content-stretch flex gap-[12px] items-center justify-center p-[16px] relative rounded-[32px] shrink-0 size-[40px]" data-name="WEB Button / Floating">
        <div className="relative shrink-0 size-[24px]" data-name="Direction=Right">
          <div className="absolute flex inset-[8.33%_25.72%_8.33%_25.67%] items-center justify-center">
            <div className="-rotate-90 flex-none h-[11.667px] w-[20px]">
              <div className="relative size-full" data-name="Vector 2 (Stroke)">
                <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 20 11.6667">
                  <path clipRule="evenodd" d={svgPaths.p32a7b500} fill="var(--fill-0, #121E6C)" fillRule="evenodd" id="Vector 2 (Stroke)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[29px] items-start left-[100px] top-[206px] w-[601px]">
      <TabsTags />
      <Group1 />
      <Frame13 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[26px] items-center justify-end relative shrink-0 w-[113px]">
      <div className="flex flex-col font-['Montserrat:Semibold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#121e6c] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Orden 1</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[15px]" data-name="icon/ic_filled_chevron">
        <div className="absolute flex inset-[29.17%_19.53%_35.18%_19.53%] items-center justify-center">
          <div className="flex-none h-[8.558px] rotate-180 w-[14.624px]">
            <div className="relative size-full">
              <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 9.14028 5.34861">
                <path d={svgPaths.p8b7f2b0} fill="var(--fill-0, #121E6C)" id="Polygon 8" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AtomAppTabs() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-center min-h-px min-w-px relative self-stretch" data-name=".atom/app_tabs">
      <Frame15 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1.5px_-0.74%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 205 3">
            <path d="M1.5 1.5H203.5" id="Vector 3" stroke="var(--stroke-0, #121E6C)" strokeLinecap="round" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex gap-[14px] items-center justify-end relative shrink-0 w-[104px]">
      <div className="flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#121e6c] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Orden 2</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[15px]" data-name="icon/ic_filled_chevron">
        <div className="absolute flex inset-[29.17%_19.53%_35.18%_19.53%] items-center justify-center">
          <div className="flex-none h-[8.558px] rotate-180 w-[14.624px]">
            <div className="relative size-full">
              <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 9.14028 5.34861">
                <path d={svgPaths.p8b7f2b0} fill="var(--fill-0, #121E6C)" id="Polygon 8" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AtomAppTabs1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-center min-h-px min-w-px relative self-stretch" data-name=".atom/app_tabs">
      <Frame22 />
    </div>
  );
}

function AppTabs1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-[404px]" data-name="APP Tabs">
      <AtomAppTabs />
      <AtomAppTabs1 />
    </div>
  );
}

function AppTabs() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-start min-h-px min-w-px relative" data-name="APP Tabs">
      <AppTabs1 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="absolute content-stretch flex gap-[20px] items-center left-[100px] top-[144px] w-[601px]">
      <AppTabs />
      <div className="content-stretch flex gap-[8px] items-center justify-center py-[12px] relative rounded-[32px] shrink-0" data-name="WEB Button">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="icon/ic_add">
          <div className="absolute inset-[16.67%]" data-name="Vector">
            <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <g id="Vector">
                <path clipRule="evenodd" d={svgPaths.pb621000} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p2a5f5a00} fill="var(--fill-0, #121E6C)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
        <p className="decoration-solid font-['Montserrat:SemiBold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#121e6c] text-[16px] text-center underline">Agregar orden</p>
      </div>
    </div>
  );
}

export default function Component01PosVentaOrden() {
  return (
    <div className="bg-[#f7f8fb] relative size-full" data-name="01pos_venta_orden">
      <Group2 />
      <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[1280px]" data-name="Browser Bar / Desktop">
        <ToolbarBrowserControls />
        <ToolbarUrlControls />
      </div>
      <div className="absolute content-stretch flex items-center justify-between left-[-1px] px-[24px] py-[4px] top-[88px] w-[1280px]" data-name="WEB Header / Panel">
        <div className="h-[24px] relative shrink-0 w-[68px]" data-name="Logotype / Bold">
          <svg className="absolute block inset-0" fill="none" preserveAspectRatio="none" viewBox="0 0 68 24">
            <path d={svgPaths.p207500a0} fill="var(--fill-0, #121E6C)" id="Vector" />
          </svg>
        </div>
        <Actions />
      </div>
      <div className="absolute content-stretch flex items-center left-[8px] top-[144px]" data-name="WEB Menu V2">
        <WebMenuMain />
      </div>
      <Group12 />
      <Frame21 />
      <Frame14 />
    </div>
  );
}