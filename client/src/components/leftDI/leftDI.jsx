import "./leftDI.scss";
import Events from "../../assets/1.png";
import Gaming from "../../assets/1.png";
import Gallery from "../../assets/1.png";
import Videos from "../../assets/1.png";
import Messages from "../../assets/1.png";
import Tutorials from "../../assets/1.png";
import Courses from "../../assets/1.png";
import Fund from "../../assets/1.png";

import ModelViewer from "../modelViewer/model_viewer";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const LeftDI = () => {

  const { currentUser } = useContext(AuthContext);
  const defaultPic = "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg";

  return (
    <div className="leftBar">
      <div className="container">
        <div className="content">
            <img src="data:image/webp;base64,UklGRvodAABXRUJQVlA4IO4dAADweQCdASriAOoAPp1EnkilpCMhKvWb0LATiWRu4MABr+fKb0/yH5Sd/923vv5M/lV1gXHvgT+u/sl1sh+/YP4K/e/cv8Ff+d7IfMC/Vr/e/37rheYv9oP3J93z/kes70Df7B/z+te9DjzbP/b7RP7ift17Mf/11lfzD2Tf6D6qvW3yC/APbH2GMhdpH1tfY/lh8Vv6v/o+G/AI9qf7Xf6Zt/UO76f637kfTr/sPzY98/sv/0PV3/V/8P+af94+evDw/Gf9b/Ve4J/PP7D/lv8N+W/1C/6P/s/Yn10/X3/m/znwKfzr+x/9XsKft17Nv7ToZimAj+oP5rLg6FLdV8c3wFjF/HtmhBoJpbBica19ISrfZ+r9ouAcl9A1X57Oi+esG5KHfwveqwJOu0Wj5NuxFJKsH73fy0TYD0uG/ue8SHBPi2Qy9vA9h9pZ57Csy/qfaPFSGvdE4seFu9lx5MtVxyxZgtGCNudCgjMHVzLde/jfdAhJv5yA7aZMJyF6RHZWp3/Ja6ClYUKjmsEDgGmg0usvc/dehodcwl2Rj77ZjLm+NWpfwjIZwJ6V+QJS4HAWl52zWy4uyR/lLiZfMncS6CG49Hu73XkNACHTi8khwUlkm902yw30HI1Qb/LFdHkiY41huPQCUXvxMhus1UikoiXBsPNin1vz+NLCCqA1L5W6JrktWKk3mnBM9JtKsvjxx+P7Vxxzf+NRu3ywuklGAE1eh2OXp5+UL2sO7dVnIr7ayDQ/n2HCxOVwi8YO1WGbjNAaPHXEA2iSsDHohP+s2Rd8IU3zNEwK9oTWgkusLlYZ9yn2xFoyhTcAjl8NFacEy83FkNaW5puU+C8N7bVTRobhzPqjXn2JLMMPVj9QmQwa+5LyYkr1c2shh9GBjQB4ZuOTKU0vlaAWK2mfBBSL0BleAhXeI2Urx4trWKbv7q7wdVHOqGjFq89ZJHu8EkbiLzfoGUDMrxUSxG0VmBHpncA/Gg7pzLypCscy+AuJc70V7bEysqC7A0fO5yVdBk1hrWbBftdKoDEYIJFAu3fyneD/9lQ1bFAhsrBVMYQdn8i31bh4c0Wu4z+SlVx0/n8TseFDcCW+2NDTEv3bKnjmlolTH9NILjwi2d8Gn695bqZOeUYiQaVxU4xr2R/GhnVYfYX4r097uB7BfayRYHJWQ4ayI4fqokD36O8BZuXQgOm7H1p30JBiEAVjb3xE2fI5rz8cZSWLc2mbvKGpiz4Ho8YnKmI/41dde9/2QPgTnj8AOj6t++Tn0V9IXPF5RWCp9P4HqHvPhafr/n3/XPvF2IqPpBatDwAA/cBzjzJKQQHLV7OdTSkqhy9f+kaOsK5F+WuXxJI/mOKMb8hbaS2A7CZgfUZgl2+OoyAds+TBwD6xqC/4R1bvf7W5FwcePWSviYMh1w9yHjmcPLyUuhvynswMZXVUowoHRXwGUDY26oFbNm1nCwtBgy56g4Ea0MwXEYS39klIS0N2igY7RJOerQlJRKIOVTnfgQzhIbSj4FSmZ0A5HLP6cdtBxmOSircAC/fwddksYC3FGOCKQGTbLrnRS6LagLFXci7w8ecCp6/D3WpCIqcRxZlv+x31BJ/3xqCO5zxis4pV5eQBki4NSyhp2TzGt5c+eQENro6XHTg10Kw2CoJ9b+fW/nQ8bzFPZ2u5gV+HCXj4my18iqaFmew8Don7aicLwArk+L094ix/8B3p0D9z2ZlbgmF5+pBw1oGp4fGIvC1gCV4Yy2T9vgwkWcPPExGRN5/kb6xEZe5mTu+37SjmNkbm+TvI39Uk54btF01tVITbj3/tXM/jvjrxKVvsJX0FRNkvq/q1FtpiFoTulvv8R97HzsZuRVydkFqYkW4K6gcHd7x0GRDAobKGSYWl9/B7PWeT/0GQwTvvK7ajJaIoTjcOH4kALcplcfrJ8LQNAipVt3DUXLwkoXosEf2OkDs/P/ghR4aYfEuFFIVvfDPgrLE9Mcb9U7dL098B/aIvO2PVcfqKCnhInjo0+D63+X36eaHnz74zGKKYgCRtkex/ls4/X+cVqTohu1c7OJSSlhZ43co1U/rmQfuqrYQN/iRbkjD19btgGXAhLgOXycMjur444uSrRggSc9lad5HF3jZ1u0CQV+Di3V+UrmLSfHYK0bLW+Y6LRlbToPG3SsMztOqR59jvJKf3GtIww9+s0MVZhDLUtpEHmAAtjfz6FY55EDMBtxNC2UkhdSx0vefXX0tOJ2Pznr0bUGleYn90smWw7aNr6obfJbjHsJKRw/qyfeRwDnZlcgpwlmyV6CngCIzeKAP3oNExgUFUdXb/I5q9bZQS+vXX2s4/k+b7O0KPqqf6P+Pe0NvM+h1oJ2dnsRSz/gnEDbuVRnMczYJBi+4KoIjmhGtbxJVtGYDQvtyj3l6orkujUYM4JjqUynMGMYfstDfncnP7M1UjIJLC+Z7NPuYdwbbMD6DSiy1SVrrKjLVDnaPH6T/FJbjzGz7KxMbdaF07LZZd4YS7Cku99oVqZdgl0xPHishvfThfbFsP6//2ejXSmF/flYvSqbggBGMGtF0/5nZxlJRITJnVY/x3lSWME9FjlF7U6/EqpvdLfqUgrLE4OasQAbS+LBxb9Cpo6QhZn3q/M4w9tJBzS9GwR/70NshGDlsJrdaxHOEIn/J8lu4/STcna+3rerzxdFU66cDSQiynTCndIXPe/5z9C6Gy3O++xJVdBxi9xiFfZwfD6b6zPNWd1n131/HGKYIjtRJLLR2UQH6JhH0UalwpTm0VAIBtzQ8j82cH8UE0xrGJY79OMVqCAIoXUg4g7Ex3+14KQvr9QTYW+BF9FoZMr+rMmBq6JYc8Kp88QoLXkd0TkSF+3PS6ejnY6GKwM2ddDXTrWKVp2BMo4ZlZm01sxtK62fBBqbh4FfamHRI8MrgAKQHjmoPsBjgvnrM69465clBjbfx4M8EzdLF1UHQiMsOhbLkNTtyf9CZXbk9hSBvFkmiXVUC3VE215U9C6Z6NcP9RKbChTLFY/9IHbGFEWF7YadqMXeBD2FPhLx537G3FEv2Nl9lHgfli80kjyB6wp4nbym0EW6MjgIFxcuWYx3A5ur2gY7W2m9SZ+SOVG1Tpk7zhTnfgEcR8Z9Xv0PtMf/J9CYo+9P68UHQDnPBP03n7Ar34zZ79/919NSl3zdzx7wXGwmJqz/BXvztMAWNafvh6rIfM/EXcYyb0Ev2cYMu4n6N8vE+xfk+8UnT8wZht3/kKs2E/kOJZwZYzdD8VwQWP22RpGmblzYwA4gnqNyr69ISjXmstPMcAabjXUeGbH1UeSeEoW/VZHEW3UFpiRdt1H3XnwbCVOHhMmf9WPPD/VJSkcvMD/jhM180Ri9PTZwgXIuWjNyJenR+sKy8NGjU3khzDGtCWDdIikIS+HlTAPtA/EyTUtsOyNflqMrq5uxFfevkJiTmBvMdXJoHvZfEBO3OgQae7vF+DW+lIIDfybAd+eujVBzV9CFPkeSC+db+P93iczsNWfO5NNwWx59sWQb2fi/kryaA3PYR3jadOgOGLpYkw2XXQ8z+c3uCKouRfhfTY4Hyw4h7bOpAAkOVVGVMHYeyNrrMIflGPJopmr/a6caBKrwcdJFOtH8F1HMtWTekiHmo6ki3lEalUJRJPZgQ5fZ2bDly6kUzXvVU6CehBCKXnv9m2buPY8TAPOtPIrbC4nwAEF+a7FN0rpKLW+txs6t18hSXIzzv8gBtIUflf6ngfVVZ3OVlBOUDDlLhqYG+3EIxDyKW5kz0mPmlJNjbtRa08u828S9vZq7ZzRRJ8KlNhvSZHBpgUmevaL/Rf6EXL5DmboN3Z25u6QICqw8o5HUjpIOmoihqju0agE9e0JvpoPWcenKSLqgy168DoKxqmi1mGb/6mXyLmgpVYtAqqsWsrQYwWcofc1SQdJp+p8/MfjGoANzKiZcCU9NAR4vbXZ+hChBY43SEXJYf+4KzEg8CAaKlpf4RDszOkqr67QT9UlImwfxO3bmMx+it1bC2qoPy9dRWEKogYIvIQX0Wl+SVttjsxJEwehK//2htJeepYSA1KyRCM6wb1vagpdTsGydjJeIDYtU3DoGhgzTiWPAzn4jeLku3OLrgiYXQMTl503XFVlD3+Oi8M34xJkqDcWaONQrBwqF53L6wSxr+HmMzvxGjA8KAQuY0qCPkCHES74dulwd2BLGEJNs0MLd8KeSiD1ydLuVb4HCRNuC3EimukbNsb/s8Qknxjw4XU0a+MSHI1cdcXjyA1SgsdP3V1b0XwFUjdF3q3j9P2zNl+nm6wSofuM3/GYyhk3LIRXiGiGhamTW8Mn79/glNmH37M2gf5KjmHgMPDfSVacV0tDtiO3fdUcuFL61DlguJyjSwicEo1mQBXLySjQBeVuJlaJ4PPorPghSHyEBOOjNOwiFFIn1qyPTfSbWuGyLIczqq2hbYyefoPJVHgypyK//DEGFqDF+gY4if0PnzB2Iwg/PKRZp+hpvV8CV3mdT5zIqmyGCbgP5OKNQn+Z/vu9wp6Jm8cKHZFziEjt+ByDG5xz46CAs5Mqtw6CsvAQNopO9shGyDBlzpUCB+VQwa4cldMc3tagnUTu+ClFYKFW4zn+D+IM/5qsObNzy1IhuecoQyFvGWjKQaDXIkVV1DxF5LrFPLWEyu+bN8/ZGbcGAt4sRFVwCQMosyT+wz/DXUML3GwiZ2eF/BFDuaW7fDoB2xcJP6gzztZIyAXN3fg21gwvh7GR7ehtwaA132uiri1uYLlfwlZHw0KLhMYWWu4mp1ByAI/ZRK4qTdrjuqSOUGHD5ncjykZ/KTitcJ+5wMiFL3BSdnMpQmhawS44MXF12RHZe8q6g54/DCzp1AXmdkzTpw2Gzy2FuTxenj51CDLGjHfnZWVh/tNDVlAl821GYZLqD9jEPrJOUngEZAXWqq9i73vqwb1CF8Z9GEW+9euFE6pqn8N44cSTxEuLvSxQ5z+sZ0+CnfmwRXpjWWruidQ7f6EG2jYauKKiUUaLcN0p33KpLzxaS96gpWt+oYuXv1D/fD3EzMciCyKVRCnc7sN7Izl+Gf/NWAWtauUDagzWfEU0OZRTi8dgwdMsv/Yqg610XPzjoAl1newlxyq6Q6h5PvQ6nJhwYLDOjPf7s/k3vkgzvsER3nLN4J21FrvD4o/9V0CuhzZh/zJHPhERbVjI3a+h2cmFO3G6PqGSHOOD3p2CudN3qR0GwABYQzbQ2Mxenw46YEYsHzohudR1gJQkcW0tqMiycO2LN7HQNw1bBuaKVIiZak/s2VKWfr3sNsSzgD8P3cZ07skiLgU287Re+cRIjVdr5L7CDbuPPAbAyjqb4j5DtPQ649dh4Oz+1CTMyUhaCiwfhl9kb4UCbFXzJpDYkjTGMywYJENn5xpFAIrVoHIYfOvhLei/2fHN3QTGKx2eFn8Y/yWid3uJvDS+vrzVAsp8TbOA5Oa426hUV+vac60ccOUlmLN31ziVm7Zrk6Vpvp7Ct2ZFKuZ7U3CPzvkdxNl7qBFNtFlBELFpsbObjU1n9FyooS6WZsVYmcpNpWT4Y5zmXdmR8B9jkMsapytEWXJBUwx39VGU7H2IBNudKszsv+k+VxBmBcquz2wRpg2eoRJgRre3ESscsQfnzf4f6Kn1kZ0VDtqFYapPr0aweFuC7havol+f2QkzJ+dbyKzACnoOhgnAACbbVFaLsP1efWCv+CnAvbF1aRVd+JqNLYuKw7uGdxRVA9Dw5G++QhbKstKKl/US70CumVTiNjMz8pBM1Rqxqs7FvlSiSOdzZ7Kw21+qcVCcmcJtTNFIpLPyTY44Xi7uaifO3BzLSWLDGxtjA+05OvREw/hr4zQzx6oTFi09Et7ylbvPzt47jNHuWm/x3pQdPfZvy17LRDc0ncNO0f/VG1YX9pLwU2QG4uybv2eWmwfGN2HrNifNZr/dr6NO49rzHO+Ao+3wdBAP7FhunOIUT+24MNRQC2HZr1DET0lFUXSA3O/mhrI5VzlELgzt/FuL3QxyK2llRBRZswt+kMqYZ3dqaukfCPMh1qjfWwcs/ZZk5vKFEaQkUG7VoUSg4FG4aY9H1DB8DKSEd/BTzkVtTTez6z8pOAwf9eMB7Dwny570ZiH8BXQAGoSYAAFX17kGcb5UZ5EQcY+/pytCj8LdEzDpuzxm9NJIIF/0N6i47J2vUfoGoO6fNboAWgg7otbA37/puJbE+KcbbQRvxvc4szip3oaLfaOpBdkhiwsyBvSOnTofiG9hjF7/LcjYo1qDHGmh7ft9EApVmgwNnwHkFrg5sWiCB65uDt4FOd653Ed4dS2Zyf7Mhx2/fRjr8PhQ1vTxx9w7ziWWDM9EzgwuX9c467yyw8VU9DqVvG2/iLBsOw8TqvxlRzD4iahAmlXz/OTf715MnRhKvZAr6CzalXmLAqA4BwCNl2M+fycl+HKWVMcSTLvlfmlH0htsvPAAACaX06JWrLIjlsWyPX62WQlWqD9/3JPBN9KZSNC3M4jiVPD5jNIH9vipAgZeRHLrrvA4ETjvaCh/XPUwUqM9pfBjJxn3ZVX6o9aVoX2cuej/fF8cOb25SDMtwkquWbvoBJncXUNOjM6ajoLoUeW9jP4JxWMDjvbc20WE30doty67mJngMe5txEP4cLTsRwoPaPxLuRNfeCG+U9ORLaCg6T6gshINTRiuGEIWxlv2s8shIWq5foN+adZ1+/5KLEY77v9Q+jZWvIoXFxRma9AfhWmAK/NOgISsjVB0EahVTXw3Aut8dI4VwZLnDCLRrh0s9s0gA4damJ4HSWH2IXpKqrhpTA04NSksPa0hMvl1VN1GlMjt8E+QZj+pYuw+UHKn0TNYp09xiUhff5WVweL47tPhAXwhJQfZ2oHltY7Pv02beWozN/KCfl4qFMlC1xOOaDM+vxBxqKb6JPKRbPMI469I0Htg8Qyhk1eoaku04aN5OtXXnR61NbINvjO4pSJ1CpdNgEa3wjYpXWaAfn+q14hsFcjckkBCVIfulqGNzq0hWwjPMYOl8g+I19s6eCOK3ov4XXfaZ7LAAKzy4gY3Ee5sOWLv7LE/SpmBuN6MsHINwq14lfGi2VKMHGiYrfYAvZHxAr2DY+M2o/F8KhgdghMhr/4NauS045FxDlhyR/+hz9HvPAlkCNzzQMNnhRvKxVTVX7Fdtmy4tF70Wt+dha82Qi5RNpecw2fVSkWRnPV5s5JJAxya5kb9W+Rxnx9gdvxW7SV+HA+nLGu24d0e3F/gfNp1Glq7ikI/DTVTIVIzcR0JJO3u2pNYEqTxCLyI11sMpUMWOIPFDXH5nHqzfkEsnjxKeOhfI5MBU7m8NePx9zND/deGJnAQqu/WczTHke7CnOlS331aRupwBgU5fuIwQEWdZH5ePFMoasnnAOwhDYovvHl0gTQowVYFVc/T7HG/dV05dFN0GLepAABCyEeHnV5BY/xILvfaxCC/MGkaV3ghvE4d70IAin7t171jvBc6gahdCUjjaCU5X8wRXw0OZulScRnngZu2OvU+EVIjYqfRSRmkcEqHLWrhZn2oAPNewh7+ZV/jCXS1clikjzNp3IoY9O40WCzBSSnT2jAbsH99ezsTCHt6SxAg4Vg3eqjjHB4x6hyPCIiElVrw2u7d5wi1Nfz6g9ekYgJeS20QJk9LUa2NtckIMjfqUUaUhRGAzmtOv+mEL7oRHGA3dKY+jEXJTRx5SnLBpfS4phy5iHwpK77VwPPZ1ZI+8dHGoDcTDgA/OG/QNta0UmvYPXFi+9flWVDdOdLifjecVYy1Ug7LmyObT3Doyvv4PzEyvsZcfXENa61Z8E2ti04jnYGsW58N9wUTaHg4u89Ysc1imxnr0yzfrjkzMUEcEFn0xyXUaxpuUrASHUn632o7cqqWsM61sq96gRyfyNpKgh8rR+1BpVx6VuMXAGFixQ9QOQJDpABUKGsKqS6pTM9oKPxQjfAsqqRvNCIxFEXfO8zTMq5istQOf/U40FoEhlZKdC+Zv39ZHq90Cvogs2PF9LH+XyRgRls+9yRf+FXigJDfHa4rOMxsBCH9+QvaLJGIXNk31pNXPC28QbU6JZCfewkH28oeqn+nfnC3XfL8XTxk/S4AwlNKP4UgS+mb4F34wSwbDV67MpbBCfX2cxEL1bJHuyDorP37SSDU0CeErhqQ+nr1U1U/zRWq6ymUVjaWGpx6DW3s7IoZHJKgDPuS50dgWU1rbeVplRk7iomhfFAfnA9i/A/YsDXHkGXH1+m175sBLvJAOzZe2UxYGE4d5fKrlPdqRNAfwSwgRNs4EORfjK6O1CwDYhSYR1I3TM1OK2MYYWpEq7HUtLm4dDmWvTT7DxlawXBzT5RG608gBFZNDxXCFWmiKeAgsw9ZAW/S0w1/FhsVYreULDdIqfBaBOm5tZuOA9LjWIoLneSWgDnYMqd1DnTHi4SbaZSbxqQox71gK1a3Vhqt2MU1v2zSPZER8lA4nlGuoK5H1L9odgG78yfftZrGm7AzQtLRUCIhDntc6Yki/H+tVsGdb09aDgS5s1bOlh54yNqjh4wjoEa+QWl9znwImEQHrC2CnUyThvn27NJu8ww53YCMZmn+sQ2tjU5Nj6oq4ISsm/EosLx8+Zlhhm4AxopZwd5ZjaEyXXcXsn3ownwHNcHb9Ih9ooV+nQYrbM7oJ/J3Tst0clnYF/l/2kBwoLn5Mwyin9SgIkem234WrUcF4HFIOi3tG4nKCFAZSziP9Ap34c0otcwpbOw7vnpckO/gf2NRs/JjXyUMVcJCzD+eLd/hBOgF4hyHARwNg6Y4DZG8cPQ3pzYfB4P90GgcMd7egbqMdjmDRK2d3jrAOaWaUalR+OkB3bxSdxr+37nvMpWw3MSuGYQ47Vy/9ngUGv+iET6p9U5H5cXp/lvtwcO6Awu0Y3bP7Ihmrk3ddZoLfe3T7z2LOqAzdPDj2xILN/5Ly7u/z5+SXtJzR9OzOF+JvZt0DcQw8GI9ID3rn9r+1k8F+9zi17NGfnm4Dv8FalM59wk5c8W+DdROJK0+fg6Rq94yNbpZ6/4RI7fqm14uQa7yWOZlwtbTVPtcyJJwRd4XP9OGWd542ox/4ZbvNDqexZONQ9YZe+3lxMaOgvgvSVx1oFNXcv1KxU/JPfZHZEeL8zHTylom/Yfx4qsRO4Ny0pKgnjlEzLMctGWLy/EA41euUwWRXkAxcJ7sFlyT4TaS/7kiq6SV7nNLN2ze6WEkAP7UGg5cQCzQx4z1vMtuwc7l36fR5AzdqJUqK5cdrFSKa7t/71+FBckiJ2cJhHEOJ0vNLjP3GxU2S+F8xooB+GqToHyIvW+N5yS419TE0Mb0ucoiXtXRcoUbtVaPuDe0N/acdSMCI7WHjOx1F8WBBXe0oz4AEW01QgBG9UrJswYlZuu9L7NVi6aHtqI/ridYMMvAUJsCGzM/w/DhDDNVXQxLugB1I2ohlDW4Z3efjgOM2P8Gp3U4JzSU+oVLNOXMWI+LGBNBMzKKAKMMDWGdKCZaZW/lpXBJX53/zjX6CB8Jb+p8uyW5mCRdbQt2Cy+uJv173Gn8AM8narFZf1IibuhRv7rVXPtRejBeRSymH8ygEvRsW6epiyqV2n7//FR4z6XheMknmyQnIGKO0nMBqdL+6ZXvUF7cm5+nKKZXdcp+iLAntMOPkmBkI+BeUO419iBgJ53pOUM2In11UlWBQCiv+OD7kcAs4vXBVGstxZOwuIRfnDWU9ORsy6pqbAL1kzhHGJAkE+cUSNCDJaNme0OH37e83PUWwG15nyzRsDga1/diA2Pfn62HTXi8QbW2Q6LO0/J9UzjVOWRPI7a+MGhdSzF/C77nAPg65opJJI/eOUDuU6v5mIRZm68TMxsjw8fwz7ekl3A2pP2OB4//Bb/xM6VabmmKL+sp62G4vpdismEi3bIrldcNnMUXYpIRLMGu7dfiuylATf3a35QcjTPJ+FPrcf2XBYA0xLT4dZOtsiNzSUYwhwLzwwmYT0eA/rVGr8QZ9jGbTAJaYIQ+BYCGnAXt83V7u63IsuF1KA8+qrM+Wvn3IE8Abp5fsKABxbg3JitnCfUrGDRsiRampzDsaSFDrnbq7vLmiPLHYwRvS/UB1DQrEuYYqbWwCxOL+5KpB3XLcBN7ywHQcO2o04kgG2zPaC2kYTMxEyaLpd4MohbgzxNGjSnGf8kduqV9BIY6BANWGMWy/q+64Tza4xlzq5FT8EAAAA=" alt="" />
          <img
            src={item?.img}
            alt=""
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400?text=Image+Error";
            }}
          />
        </div>

        <hr />{/* ส่วน 2 */}
        <div className="menu">
          <span>Your shortcuts</span>
          <div className="item">
            <img src={Events} alt="" />
            <span>Events</span>
          </div>
          <div className="item">
            <img src={Gaming} alt="" />
            <span>Gaming</span>
          </div>
          <div className="item">
            <img src={Gallery} alt="" />
            <span>Gallery</span>
          </div>
          <div className="item">
            <img src={Videos} alt="" />
            <span>Videos</span>
          </div>
          <div className="item">
            <img src={Messages} alt="" />
            <span>Messages</span>
          </div>
        </div>

        <hr />{/* ส่วน 3 */}
        <div className="menu">
          <span>Others</span>
          <div className="item">
            <img src={Fund} alt="" />
            <span>Fundraiser</span>
          </div>
          <div className="item">
            <img src={Tutorials} alt="" />
            <span>Tutorials</span>
          </div>
          <div className="item">
            <img src={Courses} alt="" />
            <span>Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftDI;
