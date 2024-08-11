// 3. Fix lỗi khi next tới 1-3 bài đầu danh sách thì không “scroll into view”
// 4. Lưu lại vị trí bài hát đang nghe, F5 lại ứng dụng không bị quay trở về bài đầu tiên
// 5. Thêm chức năng điều chỉnh âm lượng, lưu vị trí âm lượng người dùng đã chọn. Mặc định 100%

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "hoa-vo";

const playList = $(".playlist");
const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Lặng",
            singer: "Shiki",
            path: "https://audio.jukehost.co.uk/IKdQn2wAXUnQLfNb2ijqQRJKvgnpS8Md",
            image: "https://lh3.googleusercontent.com/PyKPezh6aXj0VcS6UkKu2YGRdAcI0gfTE1Tm3mZHMClOGnBnOvbXI3iGCSOkqqiXQcrZw2Zduxp0hGZv=w544-h544-l90-rj",
        },
        {
            name: "Ai Mà Biết Được",
            singer: "Soobin Hoàng Sơn x Tlinh",
            path: "https://audio.jukehost.co.uk/2JcYLg5zcJOJf4V4UZGsWi4qIJsFKSC5",
            image: "https://lh3.googleusercontent.com/ELjikOgs1rAH-kfK9oD5j_arJlPjHTMLlQKHXXs2b4MZEJztZNUlD2U9fXMBi4Ql3iR0_Ehg10wx0G4=w544-h544-l90-rj",
        },
        {
            name: "Dẫu Có Lỗi Lầm",
            singer: "Công Diễn 2: ATVNCG",
            path: "https://audio.jukehost.co.uk/GQma7dXTCnAnTdJlLQDSxaGyOjtj6R75",
            image: "https://lh3.googleusercontent.com/L4JvOKyQuT62i_NOuhY_IRMzQZDz_F8r1OTwQfrsNN9wAkBfs8YK5hNyhFlyx1IYHkJ1Jn91096BXKw=w544-h544-l90-rj",
        },
        {
            name: "Muốn anh đau",
            singer: "Winno x Hustlang Robber",
            path: "https://audio.jukehost.co.uk/PvdDvzDL0NFt2JXvBvMm4SRnjyFhRYBY",
            image: "https://lh3.googleusercontent.com/UiAgzScpBy12ULz70vRUC38Xq2kSVWs9rLr-ecGDj8Y5iaKVnPAD50vkiK1LcJv3uIIBq41fykTk3REuPg=w544-h544-l90-rj",
        },
        {
            name: "Biết Đâu Mà Lần",
            singer: "Tage",
            path: "https://audio.jukehost.co.uk/G6rMtLPHGnzdgRkUD4QCIvPq4BHmLf11",
            image: "https://lh3.googleusercontent.com/duIXUakdG6AYhvmlAI1hsR8xeJCjKeO_Uk3yVfk_em4ntcz0cEUot_dzf1Ji1pErQW1HXU8mHGP5Ug7y=w544-h544-l90-rj",
        },
        {
            name: "THERE'S NO ONE AT ALL",
            singer: "Sơn Tùng M-TP",
            path: "https://audio.jukehost.co.uk/PykQGyFaYo4Ge8C6ZOZo022cniBAgyPF",
            image: "https://lh3.googleusercontent.com/IYD9x4j8po31e3yRV-hw2Xx1nF6PUrYq2fQN9R9u7FEruR8uP07kbG3uLk61pdkWS1E_QoiORJpaRjE=w544-h544-l90-rj",
        },
        // {
        //     name: "Đoạn kết mới",
        //     singer: "Hoàng Dũng",
        //     path: "https://audio.jukehost.co.uk/cC5wrQmeLc0eghf0DslLcYXUlM28I8I8",
        //     image: "https://lh3.googleusercontent.com/ctG0BfJZBqXhELrNHS_zJr3P-YO4OOavwDFXXnbpFeBHaOQeI-fAEVUyXEaiTbkYynHfQpocaP_LkHSI=w544-h544-l90-rj",
        // },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        this.config;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${
                    index === this.currentIndex ? "active" : ""
                }" data-index='${index}'>
                <div class="thumb" style="background-image: url('${
                    song.image
                }')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
            `;
        });
        playList.innerHTML = htmls.join("\n");
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
            cd.style.opacity = newWidth / cdWidth;
        };

        // CD quay 360
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: "rotate(360deg)" }],
            {
                duration: 20000, //quay 10s
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // xử lý click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // click btn repeat
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        };

        // click btn next
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.nextSong();
            }
            _this.render();
            var playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then((_) => {});
            }
            _this.scrollToActiveSong();
        };

        // click btn prev
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.randomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
        };

        // click vat/tat btn random
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom;
            _this.setConfig("isRandom", _this.isRandom);
            randomBtn.classList.toggle("active", _this.isRandom);
        };

        // khi dc play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play();
        };
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        };

        // update progress
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPrecent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPrecent;
            }
        };

        // ev skip progress
        progress.onclick = (e) => {
            const pointProgress = progress.getBoundingClientRect();
            const clickProgress = e.clientX - pointProgress.left;
            const perClickProgress =
                (clickProgress / pointProgress.width) * 100;
            const seekTime = audio.duration * (perClickProgress / 100);
            audio.currentTime = seekTime;
        };

        progress.onmousedown = () => {
            audio.pause();
        };
        progress.onmouseup = () => {
            audio.play();
        };

        // next khi end
        audio.onended = function () {
            _this.isRepeat ? audio.play() : nextBtn.click();
        };

        // click playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest(".song:not(.active)");

            if (songNode || e.target.closest(".option")) {
                // click song
                if (songNode) {
                    //do get elemnt (songnode) nen no thanh dang chuoi
                    // vi vay de fix can chuyen ve dang so(number)
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }

                //click option
                if (e.target.closest(".option")) {
                }
            }
        };
    },

    scrollToActiveSong: () => {
        setTimeout(() => {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }, 100);
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.progress = this.config.progress;
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length;
        }
        this.loadCurrentSong();
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex > this.songs.length) {
            this.currentIndex = 0;
        }
        console.log(this.currentIndex, this.songs.length);
        this.loadCurrentSong();
    },

    randomSong: function () {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.songs.length + 1);
        } while (randomIndex === this.currentIndex);
        this.currentIndex = randomIndex;
        console.log(this.currentIndex);
        this.loadCurrentSong();
    },

    start: function () {
        //gan cau hinh config
        this.loadConfig();
        // định nghĩa thuộc tính
        this.defineProperties();
        //xử lý sự kiện
        this.handleEvents();
        //tải thông tin lần đầu chạy
        this.loadCurrentSong();
        // render Play Lít
        this.render();
        //trang thai ban dau
        randomBtn.classList.toggle("active", this.isRandom);
        repeatBtn.classList.toggle("active", this.isRepeat);
    },
};
app.start();
