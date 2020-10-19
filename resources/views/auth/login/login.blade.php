@include('auth.login.header')
<!-- BEGIN: Content-->
<body class="vertical-layout vertical-menu 1-column   blank-page" data-open="click" data-menu="vertical-menu"
      data-col="1-column">
<div class="app-content content">
    <div class="content-header row">
    </div>
    <div class="content-overlay"></div>
    <div class="content-wrapper">
        <div class="content-body">
            <section class="row flexbox-container">
                <div class="col-12 d-flex align-items-center justify-content-center">
                    <div class="col-lg-4 col-md-8 col-10 box-shadow-2 p-0">
                        <div class="card border-grey border-lighten-3 m-0">
                            <div class="card-header border-0">
                                <div class="card-title text-center">
                                    <div class="p-1"><img src="{{asset('app-assets/images/logo/logo-dark.png')}}"
                                                          alt="branding logo"></div>
                                </div>
                                <h6 class="card-subtitle line-on-side text-muted text-center font-small-3 pt-2">
                                    <span>Login with Modern</span>
                                </h6>
                            </div>
                            <div class="card-content">
                                <div class="card-body">
                                    <form class="form-horizontal form-simple" method="POST"
                                          action="{{ route('login') }}">
                                        @csrf

                                        <fieldset class="form-group position-relative has-icon-left mb-1">
                                            <input id="email" type="email" placeholder=" {{ __('E-Mail Address') }}"
                                                   class="form-control @error('email') is-invalid @enderror"
                                                   name="email" value="{{ old('email') }}" required
                                                   autocomplete="email" autofocus>
                                            <div class="form-control-position">
                                                <i class="la la-envelope"></i>
                                            </div>
                                            @error('email')
                                            <span class="invalid-feedback" role="alert">
                                                    <strong>{{ $message }}</strong></span>
                                            @enderror
                                        </fieldset>

                                        <fieldset class="form-group position-relative has-icon-left mb-1">
                                            <input id="password" type="password" placeholder="{{ __('Password') }}"
                                                   class="form-control @error('password') is-invalid @enderror"
                                                   name="password" required autocomplete="current-password">
                                            <div class="form-control-position">
                                                <i class="la la-key"></i>
                                            </div>
                                            @error('password')
                                            <span class="invalid-feedback" role="alert">
                                                   <strong>{{ $message }}</strong>
                                                    </span>
                                            @enderror
                                        </fieldset>


                                        <div class="form-group row">
                                            <div class="col-sm-6 col-12 text-center text-sm-left">
                                                <fieldset>
                                                    <input class="chk-remember" type="checkbox" name="remember"
                                                           id="remember" {{ old('remember') ? 'checked' : '' }}>

                                                    <label class="form-check-label" for="remember">
                                                        {{ __('Remember Me') }}
                                                    </label>
                                                </fieldset>
                                            </div>

                                        </div>
                                        <button type="submit" class="btn btn-info btn-block"><i
                                                class="ft-unlock"></i> {{ __('Login') }}</button>

                                    </form>
                                </div>
                            </div>
                            <div class="card-footer">
                                <div class="">
                                    <p class="float-xl-left text-center m-0">
                                        @if (Route::has('password.request'))
                                            <a class="card-link" href="{{ route('password.request') }}">
                                                {{ __('Forgot Your Password?') }}
                                            </a>
                                        @endif
                                    </p>
                                    <p class="float-xl-right text-center m-0">New ? <a
                                            href="{{route('register')}}" class="card-link">Sign Up</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>
</div>
@include('auth.login.footer')
@include('incs.session')
</body>

