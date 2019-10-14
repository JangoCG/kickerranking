let vm = new Vue({
    components: {
        Multiselect: VueMultiselect.default
    },
    data () {
        return {
            message: 'Vue is loaded.',
            // multiselect
            winners: null,
            loosers: null,
            options: [
                "cengiz",
                "charlotte",
                "4ndi",
                "hakan"
            ]
        }
    },
    methods: {
        updateSelected (newSelected) {
            this.selected = newSelected
        }
    },
    el: '#app-vue'
});
